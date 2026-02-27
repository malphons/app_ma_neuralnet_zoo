/* LSTM - Architecture Data for D3 Diagram */
(function () {
    'use strict';

    var ACCENT = '#3fb950';

    // LSTM layout: Input -> LSTM Cell (forget gate, input gate, cell state, output gate) -> Hidden -> Output
    // Show as unrolled: 3 time steps with internal gate structure
    var layerDefs = [
        { id: 'input', label: 'Input (x_t)', x: 80, count: 3, spacing: 60, startY: 65 },
        { id: 'forget-gate', label: 'Forget Gate', x: 250, count: 3, spacing: 60, startY: 65 },
        { id: 'input-gate', label: 'Input Gate', x: 400, count: 3, spacing: 60, startY: 65 },
        { id: 'cell-state', label: 'Cell State', x: 550, count: 3, spacing: 60, startY: 65 },
        { id: 'output-gate', label: 'Output Gate', x: 700, count: 3, spacing: 60, startY: 65 },
        { id: 'hidden', label: 'Hidden (h_t)', x: 850, count: 3, spacing: 60, startY: 65 }
    ];

    var layers = [];
    var allNodes = [];

    layerDefs.forEach(function (def) {
        var nodes = [];
        for (var i = 0; i < def.count; i++) {
            var isGate = def.id.indexOf('gate') !== -1;
            var node = {
                id: def.id + '-' + i,
                x: def.x,
                y: def.startY + i * def.spacing,
                r: isGate ? 14 : 16,
                color: ACCENT,
                opacity: def.id === 'cell-state' ? 0.85 : (def.id === 'input' ? 0.4 : 0.65),
                type: isGate ? 'gate' : (def.id === 'input' ? 'input' : 'dense'),
                label: def.label + ' [' + i + ']',
                outputShape: def.id + ' unit ' + i,
                params: def.id === 'input' ? 0 : 4
            };
            nodes.push(node);
            allNodes.push(node);
        }

        layers.push({
            id: def.id,
            label: def.label,
            x: def.x,
            labelY: 280,
            nodes: nodes
        });
    });

    // Connections between adjacent layers
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

    // Recurrent connections from hidden back to forget gate (show recurrence)
    for (var h = 0; h < 3; h++) {
        connections.push({
            source: 'hidden-' + h,
            target: 'forget-gate-' + h
        });
    }

    var activations = [
        { x: 165, y: 45, label: 'W_f, b_f' },
        { x: 325, y: 45, label: 'sigma' },
        { x: 475, y: 45, label: 'tanh' },
        { x: 625, y: 45, label: 'sigma' },
        { x: 775, y: 45, label: 'tanh' }
    ];

    window.NNZoo = window.NNZoo || {};
    window.NNZoo.archData = {
        layers: layers,
        connections: connections,
        activations: activations,
        config: {
            width: 950,
            height: 310,
            accentColor: ACCENT
        }
    };
})();
