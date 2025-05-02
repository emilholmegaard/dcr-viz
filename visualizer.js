// DCR Graph Visualizer using D3.js - Improved version

document.addEventListener('DOMContentLoaded', function () {
    // DOM elements
    const fileInput = document.getElementById('fileInput');
    const loadFileBtn = document.getElementById('loadFileBtn');
    const jsonInput = document.getElementById('jsonInput');
    const visualizeBtn = document.getElementById('visualizeBtn');
    const example1Btn = document.getElementById('example1Btn');
    const example2Btn = document.getElementById('example2Btn');
    const example3Btn = document.getElementById('example3Btn');
    const example4Btn = document.getElementById('example4Btn');
    const example5Btn = document.getElementById('example5Btn'); // New example for the modern layout
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetBtn = document.getElementById('resetBtn');
    const graphContainer = document.getElementById('graph');

    // D3 visualization setup
    const width = graphContainer.clientWidth;
    const height = graphContainer.clientHeight;
    let svg, g, zoom;
    let currentData; // Store the graph data globally for access in drag functions

    // Initialize graph
    initGraph();

    // Event listeners
    loadFileBtn.addEventListener('click', handleFileLoad);
    visualizeBtn.addEventListener('click', handleJsonInput);
    example1Btn.addEventListener('click', () => loadExample('example1'));
    example2Btn.addEventListener('click', () => loadExample('example2'));
    example3Btn.addEventListener('click', () => loadExample('example3'));
    example4Btn.addEventListener('click', () => loadExample('example4'));
    if (example5Btn) {
        example5Btn.addEventListener('click', () => loadExample('example5'));
    }
    zoomInBtn.addEventListener('click', () => zoomAction(1.2));
    zoomOutBtn.addEventListener('click', () => zoomAction(0.8));
    resetBtn.addEventListener('click', resetView);

    // Initialize the graph container with SVG
    function initGraph() {
        // Clear any existing content
        graphContainer.innerHTML = '';

        // Create SVG and group for graph content
        svg = d3.select('#graph')
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', [0, 0, width, height]);

        // Define arrow markers for different relation types
        const defs = svg.append('defs');

        // Arrow markers for different relation types
        const relationTypes = [
            { id: 'condition-arrow', color: '#0072bc' }, // Blue
            { id: 'response-arrow', color: '#d81e05' },  // Red
            { id: 'include-arrow', color: '#4ca64c' },   // Green
            { id: 'exclude-arrow', color: '#8000a0' },   // Purple
            { id: 'milestone-arrow', color: '#ff8000' }  // Orange
        ];

        relationTypes.forEach(type => {
            defs.append('marker')
                .attr('id', type.id)
                .attr('viewBox', '0 -5 10 10')
                .attr('refX', 8)
                .attr('refY', 0)
                .attr('orient', 'auto')
                .attr('markerWidth', 8)
                .attr('markerHeight', 8)
                .append('path')
                .attr('d', 'M0,-4L8,0L0,4')
                .attr('fill', type.color);
        });

        // Create group for zoom/pan transformations
        g = svg.append('g');

        // Setup zoom behavior
        zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);
    }

    // Handle file upload
    function handleFileLoad() {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    renderGraph(jsonData);
                } catch (error) {
                    alert('Invalid JSON file: ' + error.message);
                }
            };
            reader.readAsText(file);
        } else {
            alert('Please select a file first.');
        }
    }

    // Handle JSON input from textarea
    function handleJsonInput() {
        try {
            const jsonData = JSON.parse(jsonInput.value);
            renderGraph(jsonData);
        } catch (error) {
            alert('Invalid JSON: ' + error.message);
        }
    }

    // Load example DCR graph
    function loadExample(exampleName) {
        const exampleData = examples[exampleName];
        jsonInput.value = JSON.stringify(exampleData, null, 2);
        renderGraph(exampleData);
    }

    // Render DCR graph
    function renderGraph(data) {
        // Store data for access in drag functions
        currentData = data;

        // Clear existing graph
        g.selectAll('*').remove();

        // Add default positions if not provided
        data.events.forEach((event, i) => {
            if (event.x === undefined || event.y === undefined) {
                // Generate positions in a circle if not provided
                const angle = (i / data.events.length) * 2 * Math.PI;
                const radius = Math.min(width, height) / 3;
                event.x = width / 2 + radius * Math.cos(angle);
                event.y = height / 2 + radius * Math.sin(angle);
            }

            // Add default values for function name if not provided
            if (!event.function) {
                event.function = event.id.charAt(0).toUpperCase() + event.id.slice(1); // Capitalize first letter
            }
        });

        // Create links (relations) first so they appear behind nodes
        const linkGroup = g.append('g').attr('class', 'links');

        // Create nodes (events)
        const nodeEnter = g.selectAll('.node')
            .data(data.events)
            .enter()
            .append('g')
            .attr('class', d => {
                let classes = 'node';
                if (d.included) classes += ' included';
                else classes += ' not-included';
                if (d.executed) classes += ' executed';
                if (d.pending) classes += ' pending';
                return classes;
            })
            .attr('transform', d => `translate(${d.x}, ${d.y})`)
            .call(d3.drag()
                .on('start', dragStarted)
                .on('drag', dragged)
                .on('end', dragEnded));

        // Add activity rectangles
        nodeEnter.append('rect')
            .attr('class', 'activity-box')
            .attr('x', -80)
            .attr('y', -50)
            .attr('width', 160)
            .attr('height', 100)
            .attr('rx', 5)
            .attr('ry', 5);

        // Add header area to node
        nodeEnter.append('rect')
            .attr('class', 'activity-header')
            .attr('x', -80)
            .attr('y', -50)
            .attr('width', 160)
            .attr('height', 25)
            .attr('rx', 5)
            .attr('ry', 0);

        // Add rounded corners to the top of the header
        nodeEnter.append('path')
            .attr('class', 'header-corners')
            .attr('d', d => {
                return `M-80,-50 Q-80,-50 -75,-50 L75,-50 Q80,-50 80,-50`;
            });

        // Add header text (AUTO or role)
        nodeEnter.append('text')
            .attr('class', 'header-text')
            .attr('x', 0)
            .attr('y', -35)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .text(d => d.auto ? 'AUTO' : (d.role || ''));

        // Add activity label in middle of node
        nodeEnter.append('text')
            .attr('class', 'activity-label')
            .attr('x', 0)
            .attr('y', 0)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .text(d => d.label);

        // Add function name at bottom of node
        nodeEnter.append('text')
            .attr('class', 'function-label')
            .attr('x', 0)
            .attr('y', 35)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .text(d => d.function || '');

        // Create a lookup object for nodes by id
        const nodeById = {};
        data.events.forEach(node => {
            nodeById[node.id] = node;
        });

        // Draw relations
        data.relations.forEach(relation => {
            const source = nodeById[relation.source];
            const target = nodeById[relation.target];

            if (!source || !target) return;

            const type = relation.type;

            // Determine marker and color based on relation type
            let markerEnd, strokeColor;
            switch (type) {
                case 'condition':
                    markerEnd = 'url(#condition-arrow)';
                    strokeColor = '#0072bc';  // Blue
                    break;
                case 'response':
                    markerEnd = 'url(#response-arrow)';
                    strokeColor = '#d81e05';  // Red
                    break;
                case 'include':
                    markerEnd = 'url(#include-arrow)';
                    strokeColor = '#4ca64c';  // Green
                    break;
                case 'exclude':
                    markerEnd = 'url(#exclude-arrow)';
                    strokeColor = '#8000a0';  // Purple
                    break;
                case 'milestone':
                    markerEnd = 'url(#milestone-arrow)';
                    strokeColor = '#ff8000';  // Orange
                    break;
                default:
                    markerEnd = 'url(#condition-arrow)';
                    strokeColor = '#333';
            }

            // Calculate edge points for node boxes
            const nodeWidth = 160;
            const nodeHeight = 100;

            // Get box points
            const sourceBox = {
                left: source.x - nodeWidth / 2,
                right: source.x + nodeWidth / 2,
                top: source.y - nodeHeight / 2,
                bottom: source.y + nodeHeight / 2
            };

            const targetBox = {
                left: target.x - nodeWidth / 2,
                right: target.x + nodeWidth / 2,
                top: target.y - nodeHeight / 2,
                bottom: target.y + nodeHeight / 2
            };

            // Calculate the connection points
            let sourceX, sourceY, targetX, targetY;

            // Vector from source to target
            const dx = target.x - source.x;
            const dy = target.y - source.y;

            // Calculate angle
            const angle = Math.atan2(dy, dx);

            // Determine intersection points with the node boxes
            if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
                // Horizontal connection
                if (dx > 0) {
                    // Source → Target
                    sourceX = sourceBox.right;
                    sourceY = source.y;
                    targetX = targetBox.left;
                    targetY = target.y;
                } else {
                    // Target ← Source
                    sourceX = sourceBox.left;
                    sourceY = source.y;
                    targetX = targetBox.right;
                    targetY = target.y;
                }
            } else {
                // Vertical connection
                if (dy > 0) {
                    // Source ↓ Target
                    sourceX = source.x;
                    sourceY = sourceBox.bottom;
                    targetX = target.x;
                    targetY = targetBox.top;
                } else {
                    // Source ↑ Target
                    sourceX = source.x;
                    sourceY = sourceBox.top;
                    targetX = target.x;
                    targetY = targetBox.bottom;
                }
            }

            // Adjust intersection points based on exact angle
            if (Math.abs(Math.cos(angle)) > 0.1 && Math.abs(Math.sin(angle)) > 0.1) {
                const sourceIntersection = findBoxIntersection(source, target, nodeWidth, nodeHeight);
                const targetIntersection = findBoxIntersection(target, source, nodeWidth, nodeHeight);

                if (sourceIntersection) {
                    sourceX = sourceIntersection.x;
                    sourceY = sourceIntersection.y;
                }

                if (targetIntersection) {
                    targetX = targetIntersection.x;
                    targetY = targetIntersection.y;
                }
            }

            // Create path for relation line
            const pathData = `M${sourceX},${sourceY} L${targetX},${targetY}`;

            // Draw the path with appropriate styling
            const link = linkGroup.append('path')
                .attr('class', `link ${type}`)
                .attr('d', pathData)
                .attr('stroke', strokeColor)
                .attr('marker-end', markerEnd);

            // Add relation symbol along the path
            const pathLength = link.node().getTotalLength();
            let symbolPosition;

            // Position symbol based on relation type
            if (type === 'response') {
                // For response, place near source
                symbolPosition = link.node().getPointAtLength(pathLength * 0.2);
            } else {
                // For others, place in middle
                symbolPosition = link.node().getPointAtLength(pathLength * 0.5);
            }

            // Create symbol group
            const symbolGroup = linkGroup.append('g')
                .attr('transform', `translate(${symbolPosition.x}, ${symbolPosition.y})`);

            // Add appropriate symbol based on relation type
            switch (type) {
                case 'condition':
                    // Blue circle with asterisk
                    symbolGroup.append('circle')
                        .attr('r', 12)
                        .attr('fill', 'white')
                        .attr('stroke', strokeColor)
                        .attr('stroke-width', 2);

                    symbolGroup.append('text')
                        .attr('text-anchor', 'middle')
                        .attr('dominant-baseline', 'central')
                        .attr('fill', strokeColor)
                        .attr('font-weight', 'bold')
                        .attr('font-size', '18px')
                        .text('*');
                    break;

                case 'response':
                    // Red circle with asterisk
                    symbolGroup.append('circle')
                        .attr('r', 12)
                        .attr('fill', 'white')
                        .attr('stroke', strokeColor)
                        .attr('stroke-width', 2);

                    symbolGroup.append('text')
                        .attr('text-anchor', 'middle')
                        .attr('dominant-baseline', 'central')
                        .attr('fill', strokeColor)
                        .attr('font-weight', 'bold')
                        .attr('font-size', '18px')
                        .text('*');
                    break;

                case 'include':
                    // Green circle with plus
                    symbolGroup.append('circle')
                        .attr('r', 12)
                        .attr('fill', 'white')
                        .attr('stroke', strokeColor)
                        .attr('stroke-width', 2);

                    symbolGroup.append('text')
                        .attr('text-anchor', 'middle')
                        .attr('dominant-baseline', 'central')
                        .attr('fill', strokeColor)
                        .attr('font-weight', 'bold')
                        .attr('font-size', '18px')
                        .text('+');
                    break;

                case 'exclude':
                    // Purple circle with percent
                    symbolGroup.append('circle')
                        .attr('r', 12)
                        .attr('fill', 'white')
                        .attr('stroke', strokeColor)
                        .attr('stroke-width', 2);

                    symbolGroup.append('text')
                        .attr('text-anchor', 'middle')
                        .attr('dominant-baseline', 'central')
                        .attr('fill', strokeColor)
                        .attr('font-weight', 'bold')
                        .attr('font-size', '18px')
                        .text('%');
                    break;

                case 'milestone':
                    // Orange diamond
                    symbolGroup.append('path')
                        .attr('d', 'M0,-12 L12,0 L0,12 L-12,0 Z') // Diamond shape
                        .attr('fill', 'white')
                        .attr('stroke', strokeColor)
                        .attr('stroke-width', 2);
                    break;
            }
        });

        // Center view on the graph
        const bounds = getBoundingBox(data.events);
        centerView(bounds);
    }

    // Function to find intersection point of a line with a box
    function findBoxIntersection(boxCenter, otherPoint, boxWidth, boxHeight) {
        const halfWidth = boxWidth / 2;
        const halfHeight = boxHeight / 2;

        // Vector from boxCenter to otherPoint
        const dx = otherPoint.x - boxCenter.x;
        const dy = otherPoint.y - boxCenter.y;

        // Calculate candidate intersection points
        const candidates = [
            // Top edge
            {
                x: boxCenter.x + dx * (halfHeight / Math.abs(dy)),
                y: boxCenter.y + (dy > 0 ? halfHeight : -halfHeight),
                valid: function () {
                    return Math.abs(this.x - boxCenter.x) <= halfWidth;
                }
            },
            // Right edge
            {
                x: boxCenter.x + (dx > 0 ? halfWidth : -halfWidth),
                y: boxCenter.y + dy * (halfWidth / Math.abs(dx)),
                valid: function () {
                    return Math.abs(this.y - boxCenter.y) <= halfHeight;
                }
            },
            // Bottom edge
            {
                x: boxCenter.x + dx * (halfHeight / Math.abs(dy)),
                y: boxCenter.y + (dy > 0 ? halfHeight : -halfHeight),
                valid: function () {
                    return Math.abs(this.x - boxCenter.x) <= halfWidth;
                }
            },
            // Left edge
            {
                x: boxCenter.x + (dx > 0 ? halfWidth : -halfWidth),
                y: boxCenter.y + dy * (halfWidth / Math.abs(dx)),
                valid: function () {
                    return Math.abs(this.y - boxCenter.y) <= halfHeight;
                }
            }
        ];

        // Find the first valid intersection
        for (let i = 0; i < candidates.length; i++) {
            if (candidates[i].valid()) {
                return candidates[i];
            }
        }

        // Default to center if no valid intersection found
        return { x: boxCenter.x, y: boxCenter.y };
    }

    // Function to update link paths when nodes are dragged
    function updateLinkPaths() {
        // Reuse the renderGraph function with the current data
        renderGraph(currentData);
    }

    // Get bounding box of nodes
    function getBoundingBox(nodes) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        nodes.forEach(node => {
            minX = Math.min(minX, node.x - 80);
            minY = Math.min(minY, node.y - 50);
            maxX = Math.max(maxX, node.x + 80);
            maxY = Math.max(maxY, node.y + 50);
        });

        return { minX, minY, maxX, maxY };
    }

    // Center the view on the graph
    function centerView(bounds) {
        const dx = bounds.maxX - bounds.minX;
        const dy = bounds.maxY - bounds.minY;
        const x = (bounds.minX + bounds.maxX) / 2;
        const y = (bounds.minY + bounds.maxY) / 2;

        // Calculate the appropriate scale to fit the graph
        const scale = 0.9 / Math.max(dx / width, dy / height);

        // Apply transform to center and scale appropriately
        const transform = d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(scale)
            .translate(-x, -y);

        svg.transition()
            .duration(750)
            .call(zoom.transform, transform);
    }

    // Zoom in/out function
    function zoomAction(scaleFactor) {
        svg.transition()
            .duration(300)
            .call(zoom.scaleBy, scaleFactor);
    }

    // Reset view to original
    function resetView() {
        svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity);
    }

    // Drag functions
    function dragStarted(event, d) {
        d3.select(this).raise().classed('active', true);
    }

    function dragged(event, d) {
        d.x = event.x;
        d.y = event.y;
        d3.select(this).attr('transform', `translate(${d.x}, ${d.y})`);

        // Update link paths when nodes are dragged
        updateLinkPaths();
    }

    function dragEnded(event, d) {
        d3.select(this).classed('active', false);
    }

    // Load example by default 
    loadExample('example5');
});