// DCR Graph Visualizer using D3.js

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const fileInput = document.getElementById('fileInput');
    const loadFileBtn = document.getElementById('loadFileBtn');
    const jsonInput = document.getElementById('jsonInput');
    const visualizeBtn = document.getElementById('visualizeBtn');
    const example1Btn = document.getElementById('example1Btn');
    const example2Btn = document.getElementById('example2Btn');
    const example3Btn = document.getElementById('example3Btn');
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
        
        // Arrow marker (used for all relations)
        defs.append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 0)
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .append('path')
            .attr('d', 'M0,-4L8,0L0,4')
            .attr('class', 'arrow-head');
        
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
            reader.onload = function(e) {
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
        });
        
        // Create links (relations) first so they appear behind nodes
        const linkGroup = g.append('g').attr('class', 'links');
        
        // Create nodes (events)
        const nodes = g.selectAll('.node')
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
        
        // Add rectangle for each node
        nodes.append('rect')
            .attr('x', -70)
            .attr('y', -30)
            .attr('width', 140)
            .attr('height', 60)
            .attr('rx', 8)
            .attr('ry', 8);
        
        // Add role label at top of node (default to event id if role not specified)
        nodes.append('text')
            .attr('class', 'role-label')
            .attr('dy', -13)
            .text(d => d.role || (d.id.charAt(0).toUpperCase() + d.id.slice(1)));
        
        // Add activity label in middle of node
        nodes.append('text')
            .attr('class', 'activity-label')
            .attr('dy', 5)
            .text(d => d.label);
        
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
            
            // Calculate path points
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Adjust start and end points to be at the edges of the node boxes
            const nodeWidth = 140;
            const nodeHeight = 60;
            
            // Calculate angle between nodes
            const angle = Math.atan2(dy, dx);
            
            // Calculate edge points of source and target boxes
            let sourceX, sourceY, targetX, targetY;
            
            // If angle is more to the left/right, intersect with left/right edge
            if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
                sourceX = source.x + (dx > 0 ? nodeWidth/2 : -nodeWidth/2);
                sourceY = source.y + Math.tan(angle) * (dx > 0 ? nodeWidth/2 : -nodeWidth/2);
                targetX = target.x + (dx < 0 ? nodeWidth/2 : -nodeWidth/2);
                targetY = target.y + Math.tan(angle) * (dx < 0 ? nodeWidth/2 : -nodeWidth/2);
            } 
            // Otherwise intersect with top/bottom edge
            else {
                sourceY = source.y + (dy > 0 ? nodeHeight/2 : -nodeHeight/2);
                sourceX = source.x + (1/Math.tan(angle)) * (dy > 0 ? nodeHeight/2 : -nodeHeight/2);
                targetY = target.y + (dy < 0 ? nodeHeight/2 : -nodeHeight/2);
                targetX = target.x + (1/Math.tan(angle)) * (dy < 0 ? nodeHeight/2 : -nodeHeight/2);
            }
            
            // Calculate control point for curve (perpendicular to the line)
            const cpx = (sourceX + targetX) / 2 + dy * 0.1;
            const cpy = (sourceY + targetY) / 2 - dx * 0.1;
            
            // Create curved path
            const path = `M${sourceX},${sourceY} Q${cpx},${cpy} ${targetX},${targetY}`;
            
            // Add link path
            const link = linkGroup.append('path')
                .attr('class', `link ${type}`)
                .attr('d', path)
                .attr('marker-end', 'url(#arrowhead)');
            
            // Calculate position for symbol (at midpoint of the curve)
            const t = 0.5; // t parameter for quadratic Bezier (0.5 means midpoint)
            const symbolX = (1-t)*(1-t)*sourceX + 2*(1-t)*t*cpx + t*t*targetX;
            const symbolY = (1-t)*(1-t)*sourceY + 2*(1-t)*t*cpy + t*t*targetY;
            
            // Calculate angle for the relation type symbol
            const pathAngle = Math.atan2(targetY - sourceY, targetX - sourceX) * 180 / Math.PI;
            
            // Add relation label based on type
            let relationLabel;
            
            switch(type) {
                case 'condition':
                    relationLabel = '→*';
                    break;
                case 'response':
                    relationLabel = '*→';
                    break;
                case 'include':
                    relationLabel = '→+';
                    break;
                case 'exclude':
                    relationLabel = '→%';
                    break;
                case 'milestone':
                    relationLabel = '→◇';
                    break;
                default:
                    relationLabel = '';
            }
            
            // Add the relation label with background
            const labelGroup = linkGroup.append('g')
                .attr('transform', `translate(${symbolX}, ${symbolY})`);
            
            // Add visible white background for the label
            labelGroup.append('rect')
                .attr('x', -15)
                .attr('y', -15)
                .attr('width', 30)
                .attr('height', 25)
                .attr('class', 'relation-bg')
                .attr('rx', 3)
                .attr('ry', 3);
                
            labelGroup.append('text')
                .attr('class', `relation-symbol ${type}`)
                .attr('x', 0)
                .attr('y', 0)
                .text(relationLabel);
                
            // For visual debugging
            // labelGroup.append('circle')
            //     .attr('r', 3)
            //     .attr('fill', 'red');
        });
        
        // Center view on the graph
        const bounds = getBoundingBox(data.events);
        centerView(bounds);
    }
    
    // Function to update link paths when nodes are dragged
    function updateLinkPaths() {
        // Only proceed if we have data
        if (!currentData || !currentData.relations || !currentData.events) return;
        
        // Create a lookup object for nodes by id
        const nodeById = {};
        currentData.events.forEach(node => {
            nodeById[node.id] = node;
        });
        
        // Remove all existing links
        g.selectAll('.links').remove();
        
        // Recreate all links
        const linkGroup = g.append('g').attr('class', 'links');
        
        currentData.relations.forEach(relation => {
            const source = nodeById[relation.source];
            const target = nodeById[relation.target];
            
            if (!source || !target) return;
            
            const type = relation.type;
            
            // Calculate path points
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Adjust start and end points to be at the edges of the node boxes
            const nodeWidth = 140;
            const nodeHeight = 60;
            
            // Calculate angle between nodes
            const angle = Math.atan2(dy, dx);
            
            // Calculate edge points of source and target boxes
            let sourceX, sourceY, targetX, targetY;
            
            // If angle is more to the left/right, intersect with left/right edge
            if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
                sourceX = source.x + (dx > 0 ? nodeWidth/2 : -nodeWidth/2);
                sourceY = source.y + Math.tan(angle) * (dx > 0 ? nodeWidth/2 : -nodeWidth/2);
                targetX = target.x + (dx < 0 ? nodeWidth/2 : -nodeWidth/2);
                targetY = target.y + Math.tan(angle) * (dx < 0 ? nodeWidth/2 : -nodeWidth/2);
            } 
            // Otherwise intersect with top/bottom edge
            else {
                sourceY = source.y + (dy > 0 ? nodeHeight/2 : -nodeHeight/2);
                sourceX = source.x + (1/Math.tan(angle)) * (dy > 0 ? nodeHeight/2 : -nodeHeight/2);
                targetY = target.y + (dy < 0 ? nodeHeight/2 : -nodeHeight/2);
                targetX = target.x + (1/Math.tan(angle)) * (dy < 0 ? nodeHeight/2 : -nodeHeight/2);
            }
            
            // Calculate control point for curve (perpendicular to the line)
            const cpx = (sourceX + targetX) / 2 + dy * 0.1;
            const cpy = (sourceY + targetY) / 2 - dx * 0.1;
            
            // Create curved path
            const path = `M${sourceX},${sourceY} Q${cpx},${cpy} ${targetX},${targetY}`;
            
            // Add link path
            const link = linkGroup.append('path')
                .attr('class', `link ${type}`)
                .attr('d', path)
                .attr('marker-end', 'url(#arrowhead)');
            
            // Calculate position for symbol (at midpoint of the curve)
            const t = 0.5; // t parameter for quadratic Bezier (0.5 means midpoint)
            const symbolX = (1-t)*(1-t)*sourceX + 2*(1-t)*t*cpx + t*t*targetX;
            const symbolY = (1-t)*(1-t)*sourceY + 2*(1-t)*t*cpy + t*t*targetY;
            
            // Calculate angle for the relation type symbol
            const pathAngle = Math.atan2(targetY - sourceY, targetX - sourceX) * 180 / Math.PI;
            
            // Add relation label based on type
            let relationLabel;
            
            switch(type) {
                case 'condition':
                    relationLabel = '→*';
                    break;
                case 'response':
                    relationLabel = '*→';
                    break;
                case 'include':
                    relationLabel = '→+';
                    break;
                case 'exclude':
                    relationLabel = '→%';
                    break;
                case 'milestone':
                    relationLabel = '→◇';
                    break;
                default:
                    relationLabel = '';
            }
            
            // Add the relation label with background
            const labelGroup = linkGroup.append('g')
                .attr('transform', `translate(${symbolX}, ${symbolY})`);
            
            // Add white background for the label
            labelGroup.append('rect')
                .attr('x', -15)
                .attr('y', -15)
                .attr('width', 30)
                .attr('height', 25)
                .attr('class', 'relation-bg')
                .attr('rx', 3)
                .attr('ry', 3);
                
            labelGroup.append('text')
                .attr('class', `relation-symbol ${type}`)
                .attr('x', 0)
                .attr('y', 0)
                .text(relationLabel);
        });
    }
    
    // Get bounding box of nodes
    function getBoundingBox(nodes) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        nodes.forEach(node => {
            minX = Math.min(minX, node.x - 70);
            minY = Math.min(minY, node.y - 30);
            maxX = Math.max(maxX, node.x + 70);
            maxY = Math.max(maxY, node.y + 30);
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
    
    // Load example 1 by default
    loadExample('example1');
});
