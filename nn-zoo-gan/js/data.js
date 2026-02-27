/* GAN - Architecture Data for D3 Diagram */
(function () {
    'use strict';

    var ACCENT = '#bc8cff';

    // GAN: Two networks - Generator and Discriminator
    // Noise(3) -> G_hidden(4) -> G_output/Fake(4) -> D_hidden(3) -> D_output(1)
    var layerDefs = [
        { id: 'noise', label: 'Noise (z)', x: 80, count: 3, spacing: 65, startY: 55 },
        { id: 'g-hidden', label: 'Generator Hidden', x: 250, count: 5, spacing: 45, startY: 30 },
        { id: 'g-output', label: 'Generator Output', x: 420, count: 4, spacing: 55, startY: 45 },
        { id: 'd-hidden', label: 'Discriminator Hidden', x: 620, count: 3, spacing: 65, startY: 55 },
        { id: 'd-output', label: 'Real / Fake', x: 800, count: 1, spacing: 0, startY: 135 }
    ];

    var layers = [];

    layerDefs.forEach(function (def) {
        var nodes = [];
        for (var i = 0; i < def.count; i++) {
            var isGen = def.id.indexOf('g-') === 0 || def.id === 'noise';
            var node = {
                id: def.id + '-' + i,
                x: def.x,
                y: def.startY + i * def.spacing,
                r: def.id === 'd-output' ? 20 : 16,
                color: ACCENT,
                opacity: def.id === 'd-output' ? 1 : (def.id === 'noise' ? 0.35 : (isGen ? 0.55 : 0.7)),
                type: def.id === 'noise' ? 'noise' : (isGen ? 'generator' : 'discriminator'),
                label: def.label + ' [' + i + ']',
                outputShape: def.id + ' unit ' + i,
                params: def.id === 'noise' ? 0 : 5
            };
            nodes.push(node);
        }

        layers.push({
            id: def.id,
            label: def.label,
            x: def.x,
            labelY: 310,
            nodes: nodes
        });
    });

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
        { x: 165, y: 20, label: 'ReLU' },
        { x: 335, y: 20, label: 'tanh' },
        { x: 520, y: 20, label: 'LeakyReLU' },
        { x: 710, y: 20, label: 'sigmoid' }
    ];

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
