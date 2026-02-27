/* Convolutional Neural Network - Architecture Data for D3 Diagram */
(function () {
    'use strict';

    var ACCENT = '#58a6ff';

    // CNN Layout: Input(3) -> Conv1(4) -> Pool1(4) -> Conv2(5) -> Pool2(5) -> Dense(3) -> Output(2)
    var layerDefs = [
        { id: 'input',    label: 'Input (RGB)',     x: 80,  count: 3, spacing: 70, startY: 55 },
        { id: 'conv1',    label: 'Conv1 + ReLU',    x: 200, count: 4, spacing: 55, startY: 35 },
        { id: 'pool1',    label: 'MaxPool1',         x: 300, count: 4, spacing: 55, startY: 35 },
        { id: 'conv2',    label: 'Conv2 + ReLU',    x: 420, count: 5, spacing: 45, startY: 25 },
        { id: 'pool2',    label: 'MaxPool2',         x: 520, count: 5, spacing: 45, startY: 25 },
        { id: 'dense',    label: 'Flatten + Dense',  x: 660, count: 3, spacing: 70, startY: 55 },
        { id: 'output',   label: 'Output',           x: 800, count: 2, spacing: 70, startY: 85 }
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
                r: def.id === 'pool1' || def.id === 'pool2' ? 13 : 16,
                color: ACCENT,
                opacity: def.id === 'input' ? 0.4 :
                         def.id === 'conv1' ? 0.55 :
                         def.id === 'pool1' ? 0.5 :
                         def.id === 'conv2' ? 0.65 :
                         def.id === 'pool2' ? 0.6 :
                         def.id === 'dense' ? 0.8 :
                         1,
                type: def.id === 'input' ? 'input' :
                      def.id === 'output' ? 'output' :
                      def.id.indexOf('conv') !== -1 ? 'conv2d' :
                      def.id.indexOf('pool') !== -1 ? 'maxpool' :
                      'dense',
                label: def.label + ' [' + i + ']',
                outputShape: def.id === 'input' ? 'channel ' + i :
                             def.id.indexOf('conv') !== -1 ? 'feature map ' + i :
                             def.id.indexOf('pool') !== -1 ? 'pooled map ' + i :
                             'neuron ' + i,
                params: def.id === 'input' ? 0 :
                        def.id === 'conv1' ? 'K*K*3' :
                        def.id === 'pool1' ? 0 :
                        def.id === 'conv2' ? 'K*K*4' :
                        def.id === 'pool2' ? 0 :
                        def.id === 'dense' ? 'flat*3' :
                        3
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
        { x: 140, y: 20, label: 'ReLU' },
        { x: 250, y: 20, label: '' },
        { x: 360, y: 20, label: 'ReLU' },
        { x: 470, y: 20, label: '' },
        { x: 590, y: 20, label: 'ReLU' },
        { x: 730, y: 20, label: 'Softmax' }
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
