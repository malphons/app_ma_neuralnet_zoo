/* Perceptron / MLP - Architecture Data for D3 Diagram */
(function () {
    'use strict';

    var ACCENT = '#8b949e';

    // MLP Layout: Input(3) -> Hidden1(4) -> Hidden2(4) -> Output(2) -> Final(1)
    var layerDefs = [
        { id: 'input', label: 'Input Layer', x: 80, count: 3, spacing: 70, startY: 55 },
        { id: 'hidden1', label: 'Hidden Layer 1', x: 260, count: 4, spacing: 55, startY: 35 },
        { id: 'hidden2', label: 'Hidden Layer 2', x: 440, count: 4, spacing: 55, startY: 35 },
        { id: 'pre-output', label: 'Pre-Output', x: 620, count: 2, spacing: 70, startY: 85 },
        { id: 'output', label: 'Output', x: 800, count: 1, spacing: 0, startY: 145 }
    ];

    // Generate layers with positioned nodes
    var layers = [];
    var allNodes = [];

    layerDefs.forEach(function (def) {
        var nodes = [];
        for (var i = 0; i < def.count; i++) {
            var node = {
                id: def.id + '-' + i,
                x: def.x,
                y: def.startY + i * def.spacing,
                r: 16,
                color: ACCENT,
                opacity: def.id === 'output' ? 1 : (def.id === 'input' ? 0.45 : 0.65),
                type: def.id === 'input' ? 'input' : (def.id === 'output' ? 'output' : 'dense'),
                label: def.label + ' [' + i + ']',
                outputShape: def.id === 'input' ? 'feature ' + i : 'neuron ' + i,
                params: def.id === 'input' ? 0 : (def.id === 'hidden1' ? 4 : (def.id === 'hidden2' ? 5 : 3))
            };
            nodes.push(node);
            allNodes.push(node);
        }

        layers.push({
            id: def.id,
            label: def.label,
            x: def.x,
            labelY: 300,
            nodes: nodes
        });
    });

    // Generate fully-connected edges between adjacent layers
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

    // Activation function labels between layers
    var activations = [
        { x: 170, y: 20, label: 'ReLU' },
        { x: 350, y: 20, label: 'ReLU' },
        { x: 530, y: 20, label: 'ReLU' },
        { x: 710, y: 20, label: 'Sigmoid' }
    ];

    // Expose data
    window.NNZoo = window.NNZoo || {};
    window.NNZoo.archData = {
        layers: layers,
        connections: connections,
        activations: activations,
        config: {
            width: 900,
            height: 330,
            accentColor: ACCENT
        }
    };
})();
