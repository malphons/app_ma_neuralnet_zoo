/* ResNet - Architecture Data for D3 Diagram */
(function () {
    'use strict';

    var ACCENT = '#58a6ff';

    // ResNet: Input -> Conv Stem -> ResBlock1 -> ResBlock2 -> ResBlock3 -> GlobalAvgPool -> Dense -> Output
    var layerDefs = [
        { id: 'input', label: 'Input', x: 60, count: 3, spacing: 60, startY: 65 },
        { id: 'stem', label: 'Conv Stem (7x7)', x: 180, count: 4, spacing: 50, startY: 50 },
        { id: 'res-block1', label: 'Res Block 1', x: 320, count: 4, spacing: 50, startY: 50 },
        { id: 'res-block2', label: 'Res Block 2', x: 470, count: 4, spacing: 50, startY: 50 },
        { id: 'res-block3', label: 'Res Block 3', x: 620, count: 4, spacing: 50, startY: 50 },
        { id: 'pool', label: 'Global Avg Pool', x: 760, count: 2, spacing: 60, startY: 95 },
        { id: 'output', label: 'Output', x: 880, count: 1, spacing: 0, startY: 130 }
    ];

    var layers = [];

    layerDefs.forEach(function (def) {
        var nodes = [];
        for (var i = 0; i < def.count; i++) {
            var isRes = def.id.indexOf('res-') === 0;
            var node = {
                id: def.id + '-' + i,
                x: def.x,
                y: def.startY + i * def.spacing,
                r: def.id === 'output' ? 20 : (isRes ? 16 : 14),
                color: ACCENT,
                opacity: def.id === 'output' ? 1 : (def.id === 'input' ? 0.35 : (isRes ? 0.65 : 0.5)),
                type: isRes ? 'residual-block' : def.id,
                label: def.label + ' [' + i + ']',
                outputShape: def.id + ' unit ' + i,
                params: def.id === 'input' ? 0 : 6
            };
            nodes.push(node);
        }

        layers.push({
            id: def.id,
            label: def.label,
            x: def.x,
            labelY: 300,
            nodes: nodes
        });
    });

    // Sequential connections
    var connections = [];
    for (var i = 0; i < layerDefs.length - 1; i++) {
        var fromDef = layerDefs[i];
        var toDef = layerDefs[i + 1];
        for (var f = 0; f < fromDef.count; f++) {
            for (var t = 0; t < toDef.count; t++) {
                connections.push({
                    source: fromDef.id + '-' + f,
                    target: toDef.id + '-' + t
                });
            }
        }
    }

    // Skip connections: stem -> res-block1, res-block1 -> res-block2, res-block2 -> res-block3
    var skipPairs = [
        ['stem', 'res-block1'],
        ['res-block1', 'res-block2'],
        ['res-block2', 'res-block3']
    ];
    skipPairs.forEach(function (pair) {
        var from = pair[0];
        var to = pair[1];
        var count = Math.min(
            layerDefs.find(function(d) { return d.id === from; }).count,
            layerDefs.find(function(d) { return d.id === to; }).count
        );
        for (var s = 0; s < count; s++) {
            connections.push({
                source: from + '-' + s,
                target: to + '-' + s
            });
        }
    });

    var activations = [
        { x: 120, y: 35, label: 'BN+ReLU' },
        { x: 250, y: 35, label: 'F(x)+x' },
        { x: 395, y: 35, label: 'F(x)+x' },
        { x: 545, y: 35, label: 'F(x)+x' },
        { x: 695, y: 35, label: 'AvgPool' },
        { x: 820, y: 35, label: 'Softmax' }
    ];

    window.NNZoo = window.NNZoo || {};
    window.NNZoo.archData = {
        layers: layers,
        connections: connections,
        activations: activations,
        config: {
            width: 960,
            height: 310,
            accentColor: ACCENT
        }
    };
})();
