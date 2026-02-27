/* Perceptron / MLP - Interactive D3 Architecture Diagram */
(function () {
    'use strict';

    var svg, g, zoom;
    var isAnimating = false;

    function init(containerSelector) {
        var data = window.NNZoo.archData;
        var config = data.config;

        var container = d3.select(containerSelector);

        svg = container.append('svg')
            .attr('width', '100%')
            .attr('height', config.height + 40)
            .attr('viewBox', '0 0 ' + config.width + ' ' + (config.height + 40))
            .style('overflow', 'visible');

        // Zoom behavior
        zoom = d3.zoom()
            .scaleExtent([0.3, 5])
            .on('zoom', function (event) {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);

        g = svg.append('g');

        // Tooltip
        d3.select('body').append('div')
            .attr('class', 'arch-tooltip')
            .attr('id', 'diagram-tooltip');

        render(data);
    }

    function render(data) {
        var layers = data.layers;
        var connections = data.connections;
        var activations = data.activations;

        // Build node position map
        var nodeMap = {};
        layers.forEach(function (layer) {
            layer.nodes.forEach(function (node) {
                nodeMap[node.id] = node;
            });
        });

        // Draw connections
        var edgeGroup = g.append('g').attr('class', 'edges');
        connections.forEach(function (conn) {
            var s = nodeMap[conn.source];
            var t = nodeMap[conn.target];
            if (!s || !t) return;

            edgeGroup.append('line')
                .attr('class', 'nn-edge')
                .attr('x1', s.x)
                .attr('y1', s.y)
                .attr('x2', t.x)
                .attr('y2', t.y)
                .attr('stroke', data.config.accentColor)
                .attr('stroke-width', 1.2)
                .attr('opacity', 0.15)
                .attr('data-source', conn.source)
                .attr('data-target', conn.target);
        });

        // Draw activation function labels between layers
        if (activations) {
            var labelGroup = g.append('g').attr('class', 'activation-labels');
            activations.forEach(function (act) {
                labelGroup.append('text')
                    .attr('class', 'activation-label')
                    .attr('x', act.x)
                    .attr('y', act.y)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '10px')
                    .attr('fill', '#656d76')
                    .attr('font-family', 'monospace')
                    .text(act.label);
            });
        }

        // Draw nodes per layer
        var nodeGroup = g.append('g').attr('class', 'nodes');
        layers.forEach(function (layer) {
            var layerG = nodeGroup.append('g')
                .attr('class', 'nn-layer')
                .attr('data-layer-id', layer.id);

            layer.nodes.forEach(function (node) {
                var circle = layerG.append('circle')
                    .attr('class', 'nn-node')
                    .attr('cx', node.x)
                    .attr('cy', node.y)
                    .attr('r', node.r)
                    .attr('fill', node.color)
                    .attr('opacity', node.opacity)
                    .attr('data-node-id', node.id)
                    .style('cursor', 'pointer')
                    .style('transition', 'opacity 0.2s');

                // Hover interactions
                circle.on('mouseover', function (event) {
                    highlightNode(node.id, true);
                    showTooltip(event, node, layer);
                });

                circle.on('mouseout', function () {
                    highlightNode(node.id, false);
                    hideTooltip();
                });

                circle.on('click', function () {
                    scrollToLayer(layer.id);
                });
            });

            // Layer label
            if (layer.label) {
                layerG.append('text')
                    .attr('class', 'nn-label')
                    .attr('x', layer.x)
                    .attr('y', layer.labelY)
                    .attr('text-anchor', 'middle')
                    .attr('fill', '#656d76')
                    .attr('font-size', '11px')
                    .attr('font-family', 'sans-serif')
                    .text(layer.label);
            }
        });
    }

    function highlightNode(nodeId, active) {
        if (active) {
            g.selectAll('.nn-edge').attr('opacity', 0.04);
            g.selectAll('.nn-edge[data-source="' + nodeId + '"], .nn-edge[data-target="' + nodeId + '"]')
                .attr('opacity', 0.5)
                .attr('stroke-width', 2.5);
            g.selectAll('.nn-node').attr('opacity', 0.2);
            g.selectAll('.nn-node[data-node-id="' + nodeId + '"]').attr('opacity', 1);
        } else {
            g.selectAll('.nn-edge').attr('opacity', 0.15).attr('stroke-width', 1.2);
            g.selectAll('.nn-node').each(function () {
                var original = this.__data_opacity || 0.65;
                d3.select(this).attr('opacity', original);
            });
            // Restore original opacities from data
            var data = window.NNZoo.archData;
            data.layers.forEach(function (layer) {
                layer.nodes.forEach(function (node) {
                    g.selectAll('.nn-node[data-node-id="' + node.id + '"]').attr('opacity', node.opacity);
                });
            });
        }
    }

    function showTooltip(event, node, layer) {
        var tooltip = d3.select('#diagram-tooltip');
        var html = '<div class="arch-tooltip__label">' + layer.label + '</div>';
        html += '<div class="arch-tooltip__detail">Node: ' + node.id + '</div>';
        html += '<div class="arch-tooltip__detail">Type: ' + (node.type || 'dense') + '</div>';

        tooltip.html(html)
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 10) + 'px')
            .attr('class', 'arch-tooltip arch-tooltip--visible');
    }

    function hideTooltip() {
        d3.select('#diagram-tooltip').attr('class', 'arch-tooltip');
    }

    function scrollToLayer(layerId) {
        var card = document.querySelector('.arch-layer-card[data-layer="' + layerId + '"]');
        if (card) {
            var archTab = document.querySelector('[data-tab="architecture"]');
            if (archTab) archTab.click();
            setTimeout(function () {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                card.classList.add('arch-layer-card--highlighted');
                setTimeout(function () {
                    card.classList.remove('arch-layer-card--highlighted');
                }, 2000);
            }, 100);
        }
    }

    function animateDataFlow() {
        if (isAnimating) return;
        isAnimating = true;

        var data = window.NNZoo.archData;
        var layerXs = data.layers.map(function (l) { return l.x; });

        var delay = 0;
        var stepDuration = 600;

        layerXs.forEach(function (x) {
            setTimeout(function () {
                // Pulse nodes at this x
                g.selectAll('.nn-node').filter(function () {
                    return Math.abs(+this.getAttribute('cx') - x) < 10;
                })
                    .transition().duration(200).attr('opacity', 1).attr('r', 20)
                    .transition().duration(300).attr('opacity', 0.65).attr('r', 16);

                // Flash outgoing edges
                g.selectAll('.nn-edge').each(function () {
                    if (Math.abs(+this.getAttribute('x1') - x) < 10) {
                        d3.select(this)
                            .transition().duration(200).attr('opacity', 0.45).attr('stroke-width', 2.5)
                            .transition().duration(300).attr('opacity', 0.15).attr('stroke-width', 1.2);
                    }
                });
            }, delay);
            delay += stepDuration;
        });

        // Restore original opacities
        setTimeout(function () {
            var archData = window.NNZoo.archData;
            archData.layers.forEach(function (layer) {
                layer.nodes.forEach(function (node) {
                    g.selectAll('.nn-node[data-node-id="' + node.id + '"]')
                        .transition().duration(300)
                        .attr('opacity', node.opacity)
                        .attr('r', node.r);
                });
            });
            isAnimating = false;
        }, delay + 500);
    }

    function resetZoom() {
        svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
    }

    // Expose API
    window.NNZoo = window.NNZoo || {};
    window.NNZoo.diagram = {
        init: init,
        animateDataFlow: animateDataFlow,
        resetZoom: resetZoom
    };
})();
