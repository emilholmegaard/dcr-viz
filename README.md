# DCR-Viz: Dynamic Condition Response Graph Visualizer

A simple visualization tool for DCR (Dynamic Condition Response) graphs based on JSON format. The visualization aligns with the standard DCR notation used by [dcrgraphs.net](https://dcrgraphs.net) and [dcrsolutions.net](https://dcrsolutions.net).

## What are DCR Graphs?

DCR (Dynamic Condition Response) Graphs are a declarative process notation used for modeling flexible workflows and business processes. They focus on the constraints and relations between activities rather than their sequence.

A DCR graph consists of:
- **Events/Activities**: Nodes representing tasks or actions that can be executed
- **Relations**: Five types of directed edges between events:
  - **Condition (→*)**: One event must happen before another can execute
  - **Response (*→)**: If one event happens, another must eventually follow
  - **Include (→+)**: One event can enable another
  - **Exclude (→%)**: One event can disable another
  - **Milestone (→◇)**: One event must be in a specific state for another to execute

## Features

- Load and visualize DCR graphs from JSON format
- Interactive visualization with draggable nodes
- Zoom and pan capabilities
- Display different relation types with distinct colors and styles that match the DCR standard
- Three example DCR graphs demonstrating different process scenarios

## Usage

1. Open `index.html` in a web browser
2. Upload a DCR graph JSON file or paste JSON directly
3. Visualize and interact with the graph
4. Alternatively, try one of the included examples:
   - Application Review Process
   - Order Processing Workflow
   - Project Management Workflow (with all relation types)

## JSON Format

The visualization tool accepts DCR graphs in the following JSON format:

```json
{
  "events": [
    {
      "id": "event1",
      "label": "Event 1",
      "included": true,
      "pending": false,
      "executed": false,
      "x": 100,
      "y": 100
    },
    // more events...
  ],
  "relations": [
    {
      "type": "condition",
      "source": "event1",
      "target": "event2"
    },
    // more relations...
  ]
}
```

Relation types can be: `condition`, `response`, `include`, `exclude`, or `milestone`.

For a detailed description of the JSON format, see the [JSON Format Documentation](docs/json-format.md).

## Development

### Project Structure

- `index.html` - Main HTML file with the user interface
- `styles.css` - CSS styles for the visualization
- `visualizer.js` - JavaScript code for the D3.js visualization
- `examples.js` - Sample DCR graph examples
- `docs/` - Documentation files

### Built With

- [D3.js](https://d3js.org/) - Data visualization library used for rendering the graphs

## Acknowledgements

- Based on the DCR notation from [dcrgraphs.net](https://dcrgraphs.net) and [dcrsolutions.net](https://dcrsolutions.net)
- Influenced by the research of [Thomas Hildebrandt](http://www.itu.dk/people/hilde/) and others on Dynamic Condition Response Graphs

## License

MIT
