/* Autoencoder - Architecture Data for D3 Diagram */
(function () {
    'use strict';

    var ACCENT = '#f778ba';

    // Autoencoder: symmetric hourglass
    // Input(5) -> Encoder(3) -> Bottleneck(2) -> Decoder(3) -> Output(5)
    var layerDefs = [
        { id: 'input', label: 'Input Layer', x: 80, count: 5, spacing: 50, startY: 25 },
        { id: 'encoder', label: 'Encoder', x: 260, count: 3, spacing: 65, startY: 55 },
        { id: 'bottleneck', label: 'Latent Space', x: 440, count: 2, spacing: 70, startY: 95 },
        { id: 'decoder', label: 'Decoder', x: 620, count: 3, spacing: 65, startY: 55 },
        { id: 'output', label: 'Reconstruction', x: 800, count: 5, spacing: 50, startY: 25 }
    ];

    var layers = [];

    layerDefs.forEach(function (def) {
        var nodes = [];
        for (var i = 0; i < def.count; i++) {
            var node = {
                id: def.id + '-' + i,
                x: def.x,
                y: def.startY + i * def.spacing,
                r: def.id === 'bottleneck' ? 18 : 16,
                color: ACCENT,
                opacity: def.id === 'bottleneck' ? 0.9 : (def.id === 'input' || def.id === 'output' ? 0.4 : 0.65),
                type: def.id,
                label: def.label + ' [' + i + ']',
                outputShape: def.id + ' unit ' + i,
                params: def.id === 'input' ? 0 : 5
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

    // Fully connected between adjacent layers
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

    var activations = [
        { x: 170, y: 15, label: 'ReLU' },
        { x: 350, y: 15, label: 'ReLU' },
        { x: 530, y: 15, label: 'ReLU' },
        { x: 710, y: 15, label: 'Sigmoid' }
    ];

    window.NNZoo = window.NNZoo || {};
    window.NNZoo.archData = {
        layers: layers,
        connections: connections,
        activations: activations,
        config: {
            width: 900,
            height: 320,
            accentColor: ACCENT
        }
    };
})();
