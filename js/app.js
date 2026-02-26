/* Neural Network Zoo - Main Application Entry Point */
(function () {
    'use strict';

    /**
     * Initialize the application
     */
    async function init() {
        // Initialize theme
        initTheme();

        // Initialize gallery
        NNZoo.gallery.init('.zoo-grid');

        // Show loading skeletons
        NNZoo.gallery.renderSkeletons(8);

        // Load architectures from registry
        var architectures = await NNZoo.loadRegistry();

        // Initialize search with loaded data
        NNZoo.search.init(architectures, function (filtered) {
            NNZoo.gallery.renderCards(filtered);
        });
    }

    /**
     * Theme toggle: dark/light mode
     */
    function initTheme() {
        var html = document.documentElement;
        var toggleBtn = document.querySelector('.theme-toggle');

        // Load saved preference or detect system preference
        var saved = localStorage.getItem('nnzoo_theme');
        if (saved) {
            html.setAttribute('data-theme', saved);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            html.setAttribute('data-theme', 'light');
        } else {
            html.setAttribute('data-theme', 'dark');
        }

        if (toggleBtn) {
            toggleBtn.addEventListener('click', function () {
                var current = html.getAttribute('data-theme') || 'dark';
                var next = current === 'dark' ? 'light' : 'dark';
                html.setAttribute('data-theme', next);
                localStorage.setItem('nnzoo_theme', next);
            });
        }

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
                if (!localStorage.getItem('nnzoo_theme')) {
                    html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    // Start the app when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
