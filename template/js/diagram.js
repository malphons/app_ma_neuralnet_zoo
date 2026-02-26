/* Neural Network Zoo - D3.js Architecture Diagram Scaffold */
/* Each spoke repo copies and customizes this file */
(function () {
    'use strict';

    // ===== Configuration =====
    // Override these in your architecture-specific data.js
    var CONFIG = {
        width: 1000,
        height: 350,
        margin: { top: 30, right: 40, bottom: 30, left: 40 },
        nodeRadius: 14,
        layerGap: 160,
        animationDuration: 800,
        accentColor: '#8b949e'
    };

    var svg, g, zoom;
    var layers = [];
    var connections = [];
    var isAnimating = false;

    /**
     * Initialize the D3 diagram in the given container
     * @param {string} containerSelector - CSS selector for the diagram container
     * @param {object} config - optional config overrides
     */
    function init(containerSelector, config) {
        if (config) {
            Object.keys(config).forEach(function (key) {
                CONFIG[key] = config[key];
            });
        }

        var container = d3.select(containerSelector);
        var bounds = container.node().getBoundingClientRect();

        svg = container.append('svg')
            .attr('width', '100%')
            .attr('height', CONFIG.height)
            .attr('viewBox', '0 0 ' + CONFIG.width + ' ' + CONFIG.height);

        // Zoom behavior
        zoom = d3.zoom()
            .scaleExtent([0.3, 5])
            .on('zoom', function (event) {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);

        // Main group (transformed by zoom)
        g = svg.append('g')
            .attr('transform', 'translate(' + CONFIG.margin.left + ',' + CONFIG.margin.top + ')');

        // Tooltip element
        d3.select('body').append('div')
            .attr('class', 'arch-tooltip')
            .attr('id', 'diagram-tooltip');
    }

    /**
     * Set the architecture data (layers and connections)
     * @param {Array} layerData - array of layer objects
     * @param {Array} connectionData - array of connection objects {source, target}
     */
    function setData(layerData, connectionData) {
        layers = layerData;
        connections = connectionData;
    }

    /**
     * Render the architecture diagram
     */
    function render() {
        // Clear previous render
        g.selectAll('*').remove();

        // Draw connections first (behind nodes)
        var edgeGroup = g.append('g').attr('class', 'edges');
        renderConnections(edgeGroup);

        // Draw layers and nodes
        var layerGroup = g.append('g').attr('class', 'layers');
        renderLayers(layerGroup);
    }

    /**
     * Render connections between layers
     */
    function renderConnections(container) {
        // Build a lookup for node positions
        var nodeMap = {};
        layers.forEach(function (layer) {
            if (layer.nodes) {
                layer.nodes.forEach(function (node) {
                    nodeMap[node.id] = node;
                });
            }
            nodeMap[layer.id] = layer;
        });

        connections.forEach(function (conn) {
            var source = nodeMap[conn.source];
            var target = nodeMap[conn.target];
            if (!source || !target) return;

            var line = container.append('line')
                .attr('class', 'nn-edge')
                .attr('x1', source.x)
                .attr('y1', source.y)
                .attr('x2', target.x)
                .attr('y2', target.y)
                .attr('stroke', CONFIG.accentColor)
                .attr('stroke-width', 1.5)
                .attr('opacity', 0.25)
                .attr('data-source', conn.source)
                .attr('data-target', conn.target);
        });
    }

    /**
     * Render layers and their nodes
     */
    function renderLayers(container) {
        layers.forEach(function (layer) {
            var layerG = container.append('g')
                .attr('class', 'nn-layer')
                .attr('data-layer-id', layer.id);

            if (layer.nodes) {
                // Layer with multiple nodes
                layer.nodes.forEach(function (node) {
                    renderNode(layerG, node, layer);
                });
            } else {
                // Single-node layer
                renderNode(layerG, layer, layer);
            }

            // Layer label
            if (layer.label) {
                var labelY = layer.labelY || (CONFIG.height - CONFIG.margin.bottom - CONFIG.margin.top);
                layerG.append('text')
                    .attr('class', 'nn-label')
                    .attr('x', layer.x)
                    .attr('y', labelY)
                    .attr('text-anchor', 'middle')
                    .attr('fill', 'currentColor')
                    .attr('font-size', '11px')
                    .attr('opacity', 0.5)
                    .text(layer.label);
            }
        });
    }

    /**
     * Render a single node (circle by default)
     */
    function renderNode(container, node, layer) {
        var shape = node.shape || 'circle';
        var el;

        if (shape === 'circle') {
            el = container.append('circle')
                .attr('class', 'nn-node')
                .attr('cx', node.x)
                .attr('cy', node.y)
                .attr('r', node.r || CONFIG.nodeRadius)
                .attr('fill', node.color || CONFIG.accentColor)
                .attr('opacity', node.opacity || 0.7);
        } else if (shape === 'rect') {
            el = container.append('rect')
                .attr('class', 'nn-node')
                .attr('x', node.x - (node.width || 30) / 2)
                .attr('y', node.y - (node.height || 20) / 2)
                .attr('width', node.width || 30)
                .attr('height', node.height || 20)
                .attr('rx', 4)
                .attr('fill', node.color || CONFIG.accentColor)
                .attr('opacity', node.opacity || 0.7);
        }

        if (el) {
            el.attr('data-node-id', node.id);

            // Hover: highlight connected edges and show tooltip
            el.on('mouseover', function (event) {
                highlightNode(node.id, true);
                showTooltip(event, node, layer);
            });

            el.on('mouseout', function () {
                highlightNode(node.id, false);
                hideTooltip();
            });

            // Click: scroll to layer description
            el.on('click', function () {
                scrollToLayerCard(layer.id);
            });
        }
    }

    /**
     * Highlight a node and its connected edges
     */
    function highlightNode(nodeId, active) {
        if (active) {
            // Dim all edges
            g.selectAll('.nn-edge').attr('opacity', 0.08);
            // Highlight connected edges
            g.selectAll('.nn-edge[data-source="' + nodeId + '"], .nn-edge[data-target="' + nodeId + '"]')
                .attr('opacity', 0.6)
                .attr('stroke-width', 2.5);
            // Dim all nodes except this one
            g.selectAll('.nn-node').attr('opacity', 0.3);
            g.select('.nn-node[data-node-id="' + nodeId + '"]').attr('opacity', 1);
        } else {
            // Restore
            g.selectAll('.nn-edge').attr('opacity', 0.25).attr('stroke-width', 1.5);
            g.selectAll('.nn-node').attr('opacity', function () {
                return +this.getAttribute('opacity') || 0.7;
            });
        }
    }

    /**
     * Show tooltip near the cursor
     */
    function showTooltip(event, node, layer) {
        var tooltip = d3.select('#diagram-tooltip');
        var html = '<div class="arch-tooltip__label">' + (node.label || layer.label || node.id) + '</div>';
        if (node.type) {
            html += '<div class="arch-tooltip__detail">Type: ' + node.type + '</div>';
        }
        if (node.params) {
            html += '<div class="arch-tooltip__detail">Params: ' + formatParams(node.params) + '</div>';
        }
        if (node.outputShape) {
            html += '<div class="arch-tooltip__detail">Output: ' + node.outputShape + '</div>';
        }

        tooltip.html(html)
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 10) + 'px')
            .attr('class', 'arch-tooltip arch-tooltip--visible');
    }

    function hideTooltip() {
        d3.select('#diagram-tooltip')
            .attr('class', 'arch-tooltip');
    }

    function formatParams(params) {
        if (typeof params === 'number') return params.toLocaleString();
        if (typeof params === 'object') {
            return Object.keys(params).map(function (k) {
                return k + '=' + params[k];
            }).join(', ');
        }
        return String(params);
    }

    /**
     * Scroll to the layer description card in the content panel
     */
    function scrollToLayerCard(layerId) {
        var card = document.querySelector('.arch-layer-card[data-layer="' + layerId + '"]');
        if (card) {
            // Switch to Architecture tab
            var archTab = document.querySelector('[data-tab="architecture"]');
            if (archTab) archTab.click();

            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.classList.add('arch-layer-card--highlighted');
            setTimeout(function () {
                card.classList.remove('arch-layer-card--highlighted');
            }, 2000);
        }
    }

    /**
     * Animate data flow through the network
     */
    function animateDataFlow() {
        if (isAnimating) return;
        isAnimating = true;

        // Get unique layer x-positions in order
        var layerXs = [];
        layers.forEach(function (l) {
            if (layerXs.indexOf(l.x) === -1) layerXs.push(l.x);
        });
        layerXs.sort(function (a, b) { return a - b; });

        var delay = 0;
        layerXs.forEach(function (x, i) {
            setTimeout(function () {
                // Highlight nodes at this x position
                g.selectAll('.nn-node').filter(function () {
                    var cx = +this.getAttribute('cx') || (+this.getAttribute('x') + (+this.getAttribute('width') || 0) / 2);
                    return Math.abs(cx - x) < 10;
                })
                    .transition()
                    .duration(300)
                    .attr('opacity', 1)
                    .transition()
                    .duration(400)
                    .attr('opacity', 0.7);

                // Highlight outgoing edges
                g.selectAll('.nn-edge').each(function () {
                    var x1 = +this.getAttribute('x1');
                    if (Math.abs(x1 - x) < 10) {
                        d3.select(this)
                            .transition()
                            .duration(300)
                            .attr('opacity', 0.6)
                            .attr('stroke-width', 2.5)
                            .transition()
                            .duration(400)
                            .attr('opacity', 0.25)
                            .attr('stroke-width', 1.5);
                    }
                });
            }, delay);
            delay += CONFIG.animationDuration / layerXs.length;
        });

        setTimeout(function () {
            isAnimating = false;
        }, delay + 500);
    }

    /**
     * Reset zoom to default view
     */
    function resetZoom() {
        svg.transition()
            .duration(500)
            .call(zoom.transform, d3.zoomIdentity);
    }

    // Expose API
    window.NNZoo = window.NNZoo || {};
    window.NNZoo.diagram = {
        init: init,
        setData: setData,
        render: render,
        animateDataFlow: animateDataFlow,
        resetZoom: resetZoom
    };
})();
