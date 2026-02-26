/* Neural Network Zoo - Gallery Card Rendering */
(function () {
    'use strict';

    var gridEl = null;
    var currentArchitectures = [];

    /**
     * Initialize the gallery module
     */
    function init(gridSelector) {
        gridEl = document.querySelector(gridSelector);
    }

    /**
     * Render cards from an array of manifest objects.
     * Replaces all current grid content.
     */
    function renderCards(architectures) {
        if (!gridEl) return;

        currentArchitectures = architectures;
        gridEl.innerHTML = '';

        if (architectures.length === 0) {
            gridEl.innerHTML = renderEmptyState();
            return;
        }

        architectures.forEach(function (arch) {
            var card = createCard(arch);
            gridEl.appendChild(card);
        });

        // Fetch and inject thumbnails in parallel
        architectures.forEach(function (arch, index) {
            if (arch._coming_soon || !arch._repo_url) return;
            loadThumbnailForCard(arch, index);
        });
    }

    /**
     * Show skeleton loading cards
     */
    function renderSkeletons(count) {
        if (!gridEl) return;
        gridEl.innerHTML = '';
        for (var i = 0; i < count; i++) {
            var card = document.createElement('div');
            card.className = 'zoo-card zoo-card--skeleton';
            card.innerHTML =
                '<div class="zoo-card__thumbnail">' +
                    '<div class="skeleton skeleton-thumb"></div>' +
                '</div>' +
                '<div class="zoo-card__body">' +
                    '<div class="skeleton skeleton-title"></div>' +
                    '<div class="skeleton skeleton-text"></div>' +
                    '<div class="skeleton skeleton-text"></div>' +
                '</div>';
            gridEl.appendChild(card);
        }
    }

    /**
     * Create a single card DOM element from a manifest
     */
    function createCard(arch) {
        var isComingSoon = arch._coming_soon;
        var card = document.createElement('a');
        card.className = 'zoo-card' + (isComingSoon ? ' zoo-card--coming-soon' : '');

        if (!isComingSoon && arch._repo_url) {
            card.href = arch._repo_url + '/';
            card.target = '_blank';
            card.rel = 'noopener noreferrer';
        }

        card.setAttribute('data-id', arch.id);
        card.setAttribute('data-category', arch.category || '');

        // Thumbnail area (will be populated by loadThumbnailForCard)
        var thumbDiv = document.createElement('div');
        thumbDiv.className = 'zoo-card__thumbnail';
        thumbDiv.id = 'thumb-' + arch.id;

        if (isComingSoon) {
            // Show placeholder
            thumbDiv.innerHTML = '<div style="color: var(--text-muted); font-size: 0.9rem;">Coming Soon</div>';
        } else {
            // Show inline fallback thumbnail from manifest data
            thumbDiv.innerHTML = generateFallbackThumbnail(arch);
        }

        // Body
        var bodyDiv = document.createElement('div');
        bodyDiv.className = 'zoo-card__body';

        var titleEl = document.createElement('div');
        titleEl.className = 'zoo-card__title';
        titleEl.textContent = arch.name || arch.id;

        var yearEl = document.createElement('div');
        yearEl.className = 'zoo-card__year';
        yearEl.textContent = arch.year_introduced ? 'Est. ' + arch.year_introduced : '';

        var descEl = document.createElement('div');
        descEl.className = 'zoo-card__description';
        descEl.textContent = arch.short_description || '';

        bodyDiv.appendChild(titleEl);
        if (arch.year_introduced) bodyDiv.appendChild(yearEl);
        bodyDiv.appendChild(descEl);

        // Meta / Tags
        var metaDiv = document.createElement('div');
        metaDiv.className = 'zoo-card__meta';

        // Category badge
        if (arch.category) {
            var badge = document.createElement('span');
            badge.className = 'zoo-card__category-badge zoo-card__category-badge--' + arch.category;
            badge.textContent = arch.category;
            metaDiv.appendChild(badge);
        }

        // Top 3 tags (skip category if it's also a tag)
        var tags = (arch.tags || []).filter(function (t) { return t !== arch.category; }).slice(0, 3);
        tags.forEach(function (tag) {
            var tagEl = document.createElement('span');
            tagEl.className = 'zoo-card__tag';
            tagEl.textContent = tag;
            metaDiv.appendChild(tagEl);
        });

        // Complexity indicator
        if (arch.complexity) {
            var complexityEl = document.createElement('span');
            complexityEl.className = 'zoo-card__complexity';
            var levels = { beginner: 1, intermediate: 2, advanced: 3 };
            var level = levels[arch.complexity] || 2;
            for (var i = 1; i <= 3; i++) {
                var dot = document.createElement('span');
                dot.className = 'zoo-card__complexity-dot' + (i <= level ? ' zoo-card__complexity-dot--active' : '');
                complexityEl.appendChild(dot);
            }
            metaDiv.appendChild(complexityEl);
        }

        card.appendChild(thumbDiv);
        card.appendChild(bodyDiv);
        card.appendChild(metaDiv);

        return card;
    }

    /**
     * Generate a simple fallback SVG thumbnail based on architecture category
     */
    function generateFallbackThumbnail(arch) {
        var cat = arch.category || 'foundational';
        var color = getCategoryColor(cat);

        // Simple generic neural network diagram
        return '<svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg">' +
            '<g class="nn-layer">' +
            // Input nodes
            '<circle class="nn-node" cx="80" cy="65" r="12" fill="' + color + '" opacity="0.6"/>' +
            '<circle class="nn-node" cx="80" cy="125" r="12" fill="' + color + '" opacity="0.6"/>' +
            '<circle class="nn-node" cx="80" cy="185" r="12" fill="' + color + '" opacity="0.6"/>' +
            // Hidden nodes
            '<circle class="nn-node" cx="200" cy="85" r="12" fill="' + color + '" opacity="0.8"/>' +
            '<circle class="nn-node" cx="200" cy="165" r="12" fill="' + color + '" opacity="0.8"/>' +
            // Output node
            '<circle class="nn-node" cx="320" cy="125" r="12" fill="' + color + '"/>' +
            // Edges
            '<line class="nn-edge" x1="92" y1="65" x2="188" y2="85" stroke="' + color + '" stroke-width="1.5" opacity="0.3"/>' +
            '<line class="nn-edge" x1="92" y1="65" x2="188" y2="165" stroke="' + color + '" stroke-width="1.5" opacity="0.3"/>' +
            '<line class="nn-edge" x1="92" y1="125" x2="188" y2="85" stroke="' + color + '" stroke-width="1.5" opacity="0.3"/>' +
            '<line class="nn-edge" x1="92" y1="125" x2="188" y2="165" stroke="' + color + '" stroke-width="1.5" opacity="0.3"/>' +
            '<line class="nn-edge" x1="92" y1="185" x2="188" y2="85" stroke="' + color + '" stroke-width="1.5" opacity="0.3"/>' +
            '<line class="nn-edge" x1="92" y1="185" x2="188" y2="165" stroke="' + color + '" stroke-width="1.5" opacity="0.3"/>' +
            '<line class="nn-edge" x1="212" y1="85" x2="308" y2="125" stroke="' + color + '" stroke-width="1.5" opacity="0.3"/>' +
            '<line class="nn-edge" x1="212" y1="165" x2="308" y2="125" stroke="' + color + '" stroke-width="1.5" opacity="0.3"/>' +
            '</g>' +
            '</svg>';
    }

    function getCategoryColor(category) {
        var colors = {
            convolutional: '#58a6ff',
            recurrent: '#3fb950',
            attention: '#f0883e',
            generative: '#bc8cff',
            autoencoder: '#f778ba',
            regularization: '#d29922',
            foundational: '#8b949e'
        };
        return colors[category] || '#8b949e';
    }

    /**
     * Asynchronously load and inject the actual SVG thumbnail from the spoke repo
     */
    async function loadThumbnailForCard(arch, index) {
        if (!arch._repo_url) return;
        var svgText = await window.NNZoo.fetchThumbnail(arch._repo_url);
        if (svgText) {
            var thumbEl = document.getElementById('thumb-' + arch.id);
            if (thumbEl) {
                thumbEl.innerHTML = svgText;
            }
        }
    }

    function renderEmptyState() {
        return '<div class="zoo-empty">' +
            '<div class="zoo-empty__icon">&#x1F50D;</div>' +
            '<div class="zoo-empty__title">No architectures found</div>' +
            '<div class="zoo-empty__description">Try adjusting your search or filters</div>' +
            '</div>';
    }

    // Expose API
    window.NNZoo = window.NNZoo || {};
    window.NNZoo.gallery = {
        init: init,
        renderCards: renderCards,
        renderSkeletons: renderSkeletons
    };
})();
