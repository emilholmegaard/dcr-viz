# DCR Graph JSON Format Specification

This document describes the JSON format used by the DCR-Viz tool to visualize Dynamic Condition Response (DCR) graphs.

## Basic Structure

A DCR graph in JSON format consists of two main components:

1. **Events**: Activities or tasks that can be executed
2. **Relations**: Relationships between events that define constraints and rules

The basic structure looks like this:

```json
{
  "events": [
    // Array of event objects
  ],
  "relations": [
    // Array of relation objects
  ]
}
```

## Events

Each event in the `events` array is an object with the following properties:

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| `id` | String | Unique identifier for the event | Yes |
| `label` | String | Display name of the event | Yes |
| `included` | Boolean | Whether the event is currently included in the graph | Yes |
| `pending` | Boolean | Whether the event is pending (needs to be executed) | Yes |
| `executed` | Boolean | Whether the event has been executed | Yes |
| `x` | Number | X-coordinate for positioning the event (optional) | No |
| `y` | Number | Y-coordinate for positioning the event (optional) | No |

Example:

```json
"events": [
  {
    "id": "event1",
    "label": "Submit Application",
    "included": true,
    "pending": false,
    "executed": false,
    "x": 100,
    "y": 100
  }
]
```

If `x` and `y` coordinates are not provided, the visualization will automatically position the events in a circular layout.

## Relations

Each relation in the `relations` array is an object with the following properties:

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| `type` | String | Type of relation (condition, response, include, exclude) | Yes |
| `source` | String | ID of the source event | Yes |
| `target` | String | ID of the target event | Yes |

Example:

```json
"relations": [
  {
    "type": "condition",
    "source": "event1",
    "target": "event2"
  }
]
```

### Relation Types

DCR graphs support four types of relations:

1. **Condition** (`"type": "condition"`): The source event must have been executed (or excluded) before the target event can be executed.
   - Visual representation: Blue arrow with a filled circle (→•)

2. **Response** (`"type": "response"`): When the source event is executed, the target event becomes pending and must be executed eventually.
   - Visual representation: Red arrow with a filled circle (•→)

3. **Include** (`"type": "include"`): When the source event is executed, it includes the target event in the workflow.
   - Visual representation: Green arrow with a plus symbol (+)

4. **Exclude** (`"type": "exclude"`): When the source event is executed, it excludes the target event from the workflow.
   - Visual representation: Purple arrow with a percent symbol (%)

## Complete Example

Here's a complete example of a simple DCR graph in JSON format:

```json
{
  "events": [
    {
      "id": "event1",
      "label": "Submit Application",
      "included": true,
      "pending": false,
      "executed": false,
      "x": 100,
      "y": 100
    },
    {
      "id": "event2",
      "label": "Review Application",
      "included": true,
      "pending": false,
      "executed": false,
      "x": 300,
      "y": 100
    },
    {
      "id": "event3",
      "label": "Approve Application",
      "included": true,
      "pending": false,
      "executed": false,
      "x": 500,
      "y": 100
    }
  ],
  "relations": [
    {
      "type": "condition",
      "source": "event1",
      "target": "event2"
    },
    {
      "type": "response",
      "source": "event1",
      "target": "event2"
    },
    {
      "type": "condition",
      "source": "event2",
      "target": "event3"
    }
  ]
}
```

This example represents a simple application process where:
1. A submitted application (event1) must be reviewed (event2)
2. Submitting an application (event1) requires a review (event2) to be performed eventually
3. An application can only be approved (event3) after it has been reviewed (event2)
