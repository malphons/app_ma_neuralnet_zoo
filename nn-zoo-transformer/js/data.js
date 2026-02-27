/* Transformer - Architecture Data for D3 Diagram */
(function () {
    'use strict';

    var ACCENT = '#f0883e';

    // Transformer encoder: Embedding -> PosEnc -> MultiHeadAttn -> AddNorm -> FFN -> AddNorm -> Output
    var layerDefs = [
        { id: 'embedding', label: 'Input Embedding', x: 80, count: 4, spacing: 55, startY: 45 },
        { id: 'pos-enc', label: 'Positional Encoding', x: 220, count: 4, spacing: 55, startY: 45 },
        { id: 'attention', label: 'Multi-Head Attention', x: 380, count: 4, spacing: 55, startY: 45 },
        { id: 'ffn', label: 'Feed-Forward Network', x: 560, count: 4, spacing: 55, startY: 45 },
        { id: 'norm', label: 'Add & Norm', x: 720, count: 4, spacing: 55, startY: 45 },
        { id: 'output', label: 'Output', x: 870, count: 4, spacing: 55, startY: 45 }
    ];

    var layers = [];

    layerDefs.forEach(function (def) {
        var nodes = [];
        for (var i = 0; i < def.count; i++) {
            var node = {
                id: def.id + '-' + i,
                x: def.x,
                y: def.startY + i * def.spacing,
                r: def.id === 'attention' ? 18 : 16,
                color: ACCENT,
                opacity: def.id === 'attention' ? 0.85 : (def.id === 'embedding' ? 0.35 : 0.6),
                type: def.id,
                label: def.label + ' [' + i + ']',
                outputShape: def.id + ' dim ' + i,
                params: def.id === 'embedding' ? 0 : 6
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

    // Sequential connections between adjacent layers
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

    // Self-attention: every attention node connects to every other attention node
    for (var a = 0; a < 4; a++) {
        for (var b = 0; b < 4; b++) {
            if (a !== b) {
                connections.push({
                    source: 'attention-' + a,
                    target: 'attention-' + b
                });
            }
        }
    }

    var activations = [
        { x: 150, y: 25, label: '+ pos' },
        { x: 300, y: 25, label: 'Q,K,V' },
        { x: 470, y: 25, label: 'ReLU' },
        { x: 640, y: 25, label: 'LayerNorm' },
        { x: 795, y: 25, label: 'Softmax' }
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
