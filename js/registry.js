/* Neural Network Zoo - Registry & Manifest Discovery */
(function () {
    'use strict';

    const REGISTRY_PATH = 'data/registry.json';
    const FALLBACK_PATH = 'data/fallback-cache.json';
    const CACHE_KEY = 'nnzoo_manifest_cache';
    const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

    /**
     * Load the registry and fetch all spoke manifests.
     * Returns an array of manifest objects, each with _repo_url added.
     */
    async function loadRegistry() {
        let registry;
        try {
            const res = await fetch(REGISTRY_PATH);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            registry = await res.json();
        } catch (err) {
            console.error('Failed to load registry:', err);
            return loadFallback();
        }

        const basePattern = registry.base_url_pattern;
        const enabled = registry.architectures.filter(function (a) { return a.enabled; });

        // Check session cache
        const cached = getSessionCache();
        if (cached && cached.length > 0) {
            return cached;
        }

        var manifestPromises = enabled.map(function (arch) {
            var repoUrl = basePattern.replace('{repo_name}', arch.repo_name);
            var manifestUrl = repoUrl + '/manifest.json';

            return fetch(manifestUrl)
                .then(function (r) {
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.json();
                })
                .then(function (manifest) {
                    manifest._repo_url = repoUrl;
                    manifest._repo_name = arch.repo_name;
                    return manifest;
                })
                .catch(function (err) {
                    console.warn('Failed to load manifest for ' + arch.id + ':', err.message);
                    return null;
                });
        });

        var results = await Promise.allSettled(manifestPromises);
        var manifests = results
            .map(function (r) { return r.status === 'fulfilled' ? r.value : null; })
            .filter(Boolean);

        // If we got some live manifests, cache them and fill gaps from fallback
        if (manifests.length > 0) {
            setSessionCache(manifests);
        }

        // Fill in any missing architectures from fallback
        if (manifests.length < enabled.length) {
            var fallback = await loadFallback();
            var liveCount = manifests.length;
            var loadedIds = new Set(manifests.map(function (m) { return m.id; }));
            fallback.forEach(function (fb) {
                if (!loadedIds.has(fb.id)) {
                    // Only mark as "coming soon" if SOME live manifests loaded
                    // (meaning this specific one is genuinely unavailable).
                    // If ALL live fetches failed, use fallback as primary data.
                    if (liveCount > 0) {
                        fb._coming_soon = true;
                    }
                    manifests.push(fb);
                }
            });
        }

        return manifests;
    }

    /**
     * Load fallback cache (pre-baked manifest data for offline/fast load)
     */
    async function loadFallback() {
        try {
            var res = await fetch(FALLBACK_PATH);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            var data = await res.json();
            return data.architectures || [];
        } catch (err) {
            console.warn('Failed to load fallback cache:', err.message);
            return [];
        }
    }

    /**
     * Session storage cache to avoid re-fetching on same-session page loads
     */
    function getSessionCache() {
        try {
            var raw = sessionStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            var parsed = JSON.parse(raw);
            if (Date.now() - parsed.timestamp > CACHE_TTL) {
                sessionStorage.removeItem(CACHE_KEY);
                return null;
            }
            return parsed.manifests;
        } catch (e) {
            return null;
        }
    }

    function setSessionCache(manifests) {
        try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                manifests: manifests
            }));
        } catch (e) {
            // sessionStorage may be unavailable
        }
    }

    /**
     * Fetch a single thumbnail SVG from a spoke repo.
     * Returns the SVG markup as a string, or null on failure.
     */
    async function fetchThumbnail(repoUrl) {
        try {
            var res = await fetch(repoUrl + '/thumbnail.svg');
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return await res.text();
        } catch (err) {
            return null;
        }
    }

    // Expose API
    window.NNZoo = window.NNZoo || {};
    window.NNZoo.loadRegistry = loadRegistry;
    window.NNZoo.fetchThumbnail = fetchThumbnail;
})();
