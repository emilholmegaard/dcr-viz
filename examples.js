// Sample DCR graph examples

const examples = {
    example1: {
        events: [
            {
                id: "event1",
                label: "Submit Application",
                included: true,
                pending: false,
                executed: false,
                x: 100,
                y: 100
            },
            {
                id: "event2",
                label: "Review Application",
                included: true,
                pending: false,
                executed: false,
                x: 300,
                y: 100
            },
            {
                id: "event3",
                label: "Approve Application",
                included: true,
                pending: false,
                executed: false,
                x: 500,
                y: 100
            },
            {
                id: "event4",
                label: "Reject Application",
                included: true,
                pending: false,
                executed: false,
                x: 500,
                y: 200
            }
        ],
        relations: [
            {
                type: "condition",
                source: "event1",
                target: "event2"
            },
            {
                type: "condition",
                source: "event2",
                target: "event3"
            },
            {
                type: "condition",
                source: "event2",
                target: "event4"
            },
            {
                type: "response",
                source: "event1",
                target: "event2"
            },
            {
                type: "exclude",
                source: "event3",
                target: "event4"
            },
            {
                type: "exclude",
                source: "event4",
                target: "event3"
            }
        ]
    },
    
    example2: {
        events: [
            {
                id: "event1",
                label: "Create Order",
                included: true,
                pending: false,
                executed: false,
                x: 100,
                y: 100
            },
            {
                id: "event2",
                label: "Pay Invoice",
                included: true,
                pending: false,
                executed: false,
                x: 300,
                y: 50
            },
            {
                id: "event3",
                label: "Ship Order",
                included: true,
                pending: false,
                executed: false,
                x: 300,
                y: 150
            },
            {
                id: "event4",
                label: "Cancel Order",
                included: true,
                pending: false,
                executed: false,
                x: 100,
                y: 200
            },
            {
                id: "event5",
                label: "Refund Payment",
                included: true,
                pending: false,
                executed: false,
                x: 300,
                y: 250
            }
        ],
        relations: [
            {
                type: "response",
                source: "event1",
                target: "event2"
            },
            {
                type: "condition",
                source: "event2",
                target: "event3"
            },
            {
                type: "exclude",
                source: "event4",
                target: "event3"
            },
            {
                type: "exclude",
                source: "event3",
                target: "event4"
            },
            {
                type: "condition",
                source: "event1",
                target: "event4"
            },
            {
                type: "condition",
                source: "event2",
                target: "event5"
            },
            {
                type: "response",
                source: "event4",
                target: "event5"
            },
            {
                type: "include",
                source: "event4",
                target: "event5"
            }
        ]
    }
};
