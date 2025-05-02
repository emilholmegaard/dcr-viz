// DCR Graph Visualizer using D3.js

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const fileInput = document.getElementById('fileInput');
    const loadFileBtn = document.getElementById('loadFileBtn');
    const jsonInput = document.getElementById('jsonInput');
    const visualizeBtn = document.getElementById('visualizeBtn');
    const example1Btn = document.getElementById('example1Btn');
    const example2Btn = document.getElementById('example2Btn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetBtn = document.getElementById('resetBtn');
    const graphContainer = document.getElementById('graph');

    // D3 visualization setup
    const width = graphContainer.clientWidth;
    const height = graphContainer.clientHeight;
    let svg, g, zoom;
    
    // Initialize graph
    initGraph();
    
    // Event listeners
    loadFileBtn.addEventListener('click', handleFileLoad);
    visualizeBtn.addEventListener('click', handleJsonInput);
    example1Btn.addEventListener('click', () => loadExample('example1'));
    example2Btn.addEventListener('click', () => loadExample('example2'));
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
        svg.append('defs')
            .selectAll('marker')
            .data(['condition', 'response', 'include', 'exclude'])
            .enter()
            .append('marker')
            .attr('id', d => `arrow-${d}`)
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 20)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .attr('class', d => `marker ${d}`)
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5');
        
        // Add specific markers for relation types
        const defs = svg.select('defs');
        
        // Condition marker (filled circle)
        defs.append('marker')
            .attr('id', 'condition-circle')
            .attr('viewBox', '0 0 10 10')
            .attr('refX', 5)
            .attr('refY', 5)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('class', 'marker condition')
            .append('circle')
            .attr('cx', 5)
            .attr('cy', 5)
            .attr('r', 3);
        
        // Response marker (filled circle)
        defs.append('marker')
            .attr('id', 'response-circle')
            .attr('viewBox', '0 0 10 10')
            .attr('refX', 5)
            .attr('refY', 5)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('class', 'marker response')
            .append('circle')
            .attr('cx', 5)
            .attr('cy', 5)
            .attr('r', 3);
            
        // Include marker (+ symbol)
        defs.append('marker')
            .attr('id', 'include-symbol')
            .attr('viewBox', '0 0 10 10')
            .attr('refX', 5)
            .attr('refY', 5)
            .attr('markerWidth', 8)
            .attr('markerHeight', 8)
            .attr('class', 'marker include')
            .append('path')
            .attr('d', 'M3,5 H7 M5,3 V7');
            
        // Exclude marker (% symbol)
        defs.append('marker')
            .attr('id', 'exclude-symbol')
            .attr('viewBox', '0 0 10 10')
            .attr('refX', 5)
            .attr('refY', 5)
            .attr('markerWidth', 8)
            .attr('markerHeight', 8)
            .attr('class', 'marker exclude')
            .append('path')
            .attr('d', 'M2,2 L8,8 M8,2 L2,8');
        
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
        
        // Create links (relations)
        const links = g.selectAll('.link')
            .data(data.relations)
            .enter()
            .append('path')
            .attr('class', d => `link ${d.type}`)
            .attr('marker-end', d => {
                if (d.type === 'condition') return 'url(#arrow-condition)';
                if (d.type === 'response') return 'url(#arrow-response)';
                if (d.type === 'include') return 'url(#arrow-include)';
                if (d.type === 'exclude') return 'url(#arrow-exclude)';
            })
            .attr('marker-mid', d => {
                if (d.type === 'condition') return 'url(#condition-circle)';
                if (d.type === 'response') return 'url(#response-circle)';
                if (d.type === 'include') return 'url(#include-symbol)';
                if (d.type === 'exclude') return 'url(#exclude-symbol)';
            });
        
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
            .attr('x', -60)
            .attr('y', -20)
            .attr('width', 120)
            .attr('height', 40)
            .attr('rx', 5)
            .attr('ry', 5);
        
        // Add text label for each node
        nodes.append('text')
            .attr('dy', 5)
            .text(d => d.label);
        
        // Create a lookup object for nodes by id
        const nodeById = {};
        data.events.forEach(node => {
            nodeById[node.id] = node;
        });
        
        // Update link paths
        updateLinkPaths();
        
        // Setup simulation for force layout if needed
        /* Uncomment to enable force layout
        const simulation = d3.forceSimulation(data.events)
            .force('charge', d3.forceManyBody().strength(-500))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(80))
            .on('tick', () => {
                nodes.attr('transform', d => `translate(${d.x}, ${d.y})`);
                updateLinkPaths();
            });
        */
        
        // Function to update the paths between nodes
        function updateLinkPaths() {
            links.attr('d', d => {
                const source = nodeById[d.source];
                const target = nodeById[d.target];
                
                if (!source || !target) return '';
                
                // Calculate path with a curve
                return `M${source.x},${source.y} Q${(source.x + target.x) / 2 + 30},${(source.y + target.y) / 2} ${target.x},${target.y}`;
            });
        }
        
        // Center view on the graph
        const bounds = getBoundingBox(data.events);
        centerView(bounds);
    }
    
    // Get bounding box of nodes
    function getBoundingBox(nodes) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        nodes.forEach(node => {
            minX = Math.min(minX, node.x - 60);
            minY = Math.min(minY, node.y - 20);
            maxX = Math.max(maxX, node.x + 60);
            maxY = Math.max(maxY, node.y + 20);
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
        g.selectAll('.link').attr('d', link => {
            const source = data.events.find(n => n.id === link.source);
            const target = data.events.find(n => n.id === link.target);
            
            if (!source || !target) return '';
            
            return `M${source.x},${source.y} Q${(source.x + target.x) / 2 + 30},${(source.y + target.y) / 2} ${target.x},${target.y}`;
        });
    }
    
    function dragEnded(event, d) {
        d3.select(this).classed('active', false);
    }
    
    // Load example 1 by default
    loadExample('example1');
});
