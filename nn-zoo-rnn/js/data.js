/* Recurrent Neural Network - Architecture Data for D3 Diagram */
(function () {
    'use strict';

    var ACCENT = '#3fb950';

    // Time-unrolled RNN: 4 time steps
    // Each time step: input at bottom, hidden state in middle, output at top
    // Plus a dense output node at the far right
    var layerDefs = [
        { id: 'input-t0',  label: 'x(t-1)',       x: 100, count: 1, spacing: 0, startY: 260 },
        { id: 'hidden-t0', label: 'h(t-1)',        x: 100, count: 1, spacing: 0, startY: 150 },
        { id: 'input-t1',  label: 'x(t)',          x: 300, count: 1, spacing: 0, startY: 260 },
        { id: 'hidden-t1', label: 'h(t)',          x: 300, count: 1, spacing: 0, startY: 150 },
        { id: 'output-t1', label: 'y(t)',          x: 300, count: 1, spacing: 0, startY: 50  },
        { id: 'input-t2',  label: 'x(t+1)',        x: 500, count: 1, spacing: 0, startY: 260 },
        { id: 'hidden-t2', label: 'h(t+1)',        x: 500, count: 1, spacing: 0, startY: 150 },
        { id: 'dense-out', label: 'Dense Output',  x: 700, count: 1, spacing: 0, startY: 150 }
    ];

    // Generate layers with positioned nodes
    var layers = [];
    var allNodes = [];

    layerDefs.forEach(function (def) {
        var nodes = [];
        for (var i = 0; i < def.count; i++) {
            var isInput = def.id.indexOf('input') === 0;
            var isOutput = def.id.indexOf('output') === 0 || def.id === 'dense-out';
            var isHidden = def.id.indexOf('hidden') === 0;
            var node = {
                id: def.id + '-' + i,
                x: def.x,
                y: def.startY + i * def.spacing,
                r: 16,
                color: ACCENT,
                opacity: isInput ? 0.45 : (isHidden ? 0.65 : 1),
                type: isInput ? 'input' : (isHidden ? 'recurrent' : 'output'),
                label: def.label + ' [' + i + ']',
                outputShape: isInput ? 'input vector' : (isHidden ? 'hidden state' : 'prediction'),
                params: isInput ? 0 : (isHidden ? 3 : 2)
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

    // Connections:
    // 1. Each input connects to its corresponding hidden state (vertical)
    // 2. Each hidden state connects to the next hidden state (recurrence, horizontal)
    // 3. Hidden states connect to output
    // 4. Last hidden state connects to dense output
    var connections = [];

    // Input -> Hidden (vertical within each time step)
    connections.push({ source: 'input-t0-0', target: 'hidden-t0-0' });
    connections.push({ source: 'input-t1-0', target: 'hidden-t1-0' });
    connections.push({ source: 'input-t2-0', target: 'hidden-t2-0' });

    // Hidden -> Hidden (recurrence arrows, left to right)
    connections.push({ source: 'hidden-t0-0', target: 'hidden-t1-0' });
    connections.push({ source: 'hidden-t1-0', target: 'hidden-t2-0' });

    // Hidden -> Output (vertical upward)
    connections.push({ source: 'hidden-t1-0', target: 'output-t1-0' });

    // Last hidden -> Dense output
    connections.push({ source: 'hidden-t2-0', target: 'dense-out-0' });

    // Activation function labels between layers
    var activations = [
        { x: 100, y: 205, label: 'tanh' },
        { x: 200, y: 135, label: 'W_hh' },
        { x: 300, y: 205, label: 'tanh' },
        { x: 400, y: 135, label: 'W_hh' },
        { x: 500, y: 205, label: 'tanh' },
        { x: 300, y: 100, label: 'W_hy' },
        { x: 600, y: 135, label: 'Softmax' }
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
