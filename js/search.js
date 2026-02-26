/* Neural Network Zoo - Search & Filter Logic */
(function () {
    'use strict';

    var searchIndex = [];
    var allArchitectures = [];
    var activeCategory = 'all';
    var activeQuery = '';
    var activeSort = 'name';
    var onChangeCallback = null;

    var CATEGORIES = [
        { id: 'all', label: 'All' },
        { id: 'foundational', label: 'Foundational' },
        { id: 'convolutional', label: 'Convolutional' },
        { id: 'recurrent', label: 'Recurrent' },
        { id: 'attention', label: 'Attention' },
        { id: 'generative', label: 'Generative' },
        { id: 'autoencoder', label: 'Autoencoder' },
        { id: 'regularization', label: 'Regularization' }
    ];

    /**
     * Initialize the search module with architecture data.
     * @param {Array} architectures - array of manifest objects
     * @param {Function} onChange - called with filtered results whenever filters change
     */
    function init(architectures, onChange) {
        allArchitectures = architectures;
        onChangeCallback = onChange;
        buildSearchIndex(architectures);
        bindEvents();
        renderFilterPills();
        applyFilters();
    }

    /**
     * Build a pre-computed search index for fast matching
     */
    function buildSearchIndex(architectures) {
        searchIndex = architectures.map(function (arch) {
            var searchText = [
                arch.name || '',
                arch.short_description || '',
                arch.long_description || '',
                arch.category || '',
                (arch.tags || []).join(' '),
                (arch.use_cases || []).join(' '),
                (arch.layer_types || []).join(' '),
                arch.key_paper || '',
                String(arch.year_introduced || '')
            ].join(' ').toLowerCase();

            return {
                arch: arch,
                searchText: searchText
            };
        });
    }

    /**
     * Filter architectures by current query and category
     */
    function filterArchitectures() {
        var results = searchIndex;

        // Category filter
        if (activeCategory && activeCategory !== 'all') {
            results = results.filter(function (item) {
                return item.arch.category === activeCategory;
            });
        }

        // Text search (all terms must match)
        if (activeQuery && activeQuery.trim().length > 0) {
            var terms = activeQuery.toLowerCase().trim().split(/\s+/);
            results = results.filter(function (item) {
                return terms.every(function (term) {
                    return item.searchText.indexOf(term) !== -1;
                });
            });
        }

        var filtered = results.map(function (item) { return item.arch; });

        // Sort
        filtered = sortArchitectures(filtered, activeSort);

        return filtered;
    }

    /**
     * Sort architectures
     */
    function sortArchitectures(architectures, sortBy) {
        var sorted = architectures.slice();
        switch (sortBy) {
            case 'name':
                sorted.sort(function (a, b) {
                    return (a.name || '').localeCompare(b.name || '');
                });
                break;
            case 'year-asc':
                sorted.sort(function (a, b) {
                    return (a.year_introduced || 9999) - (b.year_introduced || 9999);
                });
                break;
            case 'year-desc':
                sorted.sort(function (a, b) {
                    return (b.year_introduced || 0) - (a.year_introduced || 0);
                });
                break;
            case 'complexity':
                var levels = { beginner: 1, intermediate: 2, advanced: 3 };
                sorted.sort(function (a, b) {
                    return (levels[a.complexity] || 2) - (levels[b.complexity] || 2);
                });
                break;
        }
        return sorted;
    }

    /**
     * Apply current filters and notify the callback
     */
    function applyFilters() {
        var results = filterArchitectures();
        updateResultCount(results.length, allArchitectures.length);
        if (onChangeCallback) {
            onChangeCallback(results);
        }
    }

    /**
     * Render category filter pills
     */
    function renderFilterPills() {
        var container = document.querySelector('.zoo-filters');
        if (!container) return;

        // Clear existing pills (keep label)
        var label = container.querySelector('.zoo-filters__label');
        container.innerHTML = '';
        if (label) container.appendChild(label);

        CATEGORIES.forEach(function (cat) {
            var pill = document.createElement('button');
            pill.className = 'zoo-filter-pill' +
                (cat.id !== 'all' ? ' zoo-filter-pill--' + cat.id : '') +
                (cat.id === activeCategory ? ' zoo-filter-pill--active' : '');
            pill.textContent = cat.label;
            pill.setAttribute('data-category', cat.id);

            pill.addEventListener('click', function () {
                activeCategory = cat.id;
                updateActivePill();
                applyFilters();
            });

            container.appendChild(pill);
        });
    }

    /**
     * Update which pill has the active class
     */
    function updateActivePill() {
        var pills = document.querySelectorAll('.zoo-filter-pill');
        pills.forEach(function (pill) {
            var catId = pill.getAttribute('data-category');
            if (catId === activeCategory) {
                pill.classList.add('zoo-filter-pill--active');
            } else {
                pill.classList.remove('zoo-filter-pill--active');
            }
        });
    }

    /**
     * Update the result count display
     */
    function updateResultCount(shown, total) {
        var countEl = document.querySelector('.zoo-search__count');
        if (countEl) {
            if (shown === total) {
                countEl.textContent = total + ' architecture' + (total !== 1 ? 's' : '');
            } else {
                countEl.textContent = 'Showing ' + shown + ' of ' + total;
            }
        }
    }

    /**
     * Bind event listeners
     */
    function bindEvents() {
        // Search input with debounce
        var searchInput = document.querySelector('.zoo-search__input');
        if (searchInput) {
            var debounceTimer = null;
            searchInput.addEventListener('input', function (e) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(function () {
                    activeQuery = e.target.value;
                    applyFilters();
                }, 200);
            });

            // Clear on Escape
            searchInput.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    searchInput.value = '';
                    activeQuery = '';
                    applyFilters();
                }
            });
        }

        // Sort dropdown
        var sortSelect = document.querySelector('.zoo-search__sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', function (e) {
                activeSort = e.target.value;
                applyFilters();
            });
        }
    }

    // Expose API
    window.NNZoo = window.NNZoo || {};
    window.NNZoo.search = {
        init: init,
        getCategories: function () { return CATEGORIES; }
    };
})();
