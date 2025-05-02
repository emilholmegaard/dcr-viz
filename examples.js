// Sample DCR graph examples

const examples = {
    // Application review process
    example1: {
        events: [
            {
                id: "event1",
                label: "Submit Application",
                role: "Applicant",
                included: true,
                pending: false,
                executed: false,
                x: 100,
                y: 100
            },
            {
                id: "event2",
                label: "Review Application",
                role: "Reviewer",
                included: true,
                pending: false,
                executed: false,
                x: 300,
                y: 100
            },
            {
                id: "event3",
                label: "Approve Application",
                role: "Manager",
                included: true,
                pending: false,
                executed: false,
                x: 500,
                y: 100
            },
            {
                id: "event4",
                label: "Reject Application",
                role: "Manager",
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
    
    // Order processing workflow
    example2: {
        events: [
            {
                id: "event1",
                label: "Create Order",
                role: "Customer",
                included: true,
                pending: false,
                executed: false,
                x: 100,
                y: 100
            },
            {
                id: "event2",
                label: "Pay Invoice",
                role: "Customer",
                included: true,
                pending: false,
                executed: false,
                x: 300,
                y: 50
            },
            {
                id: "event3",
                label: "Ship Order",
                role: "Warehouse",
                included: true,
                pending: false,
                executed: false,
                x: 300,
                y: 150
            },
            {
                id: "event4",
                label: "Cancel Order",
                role: "Customer",
                included: true,
                pending: false,
                executed: false,
                x: 100,
                y: 200
            },
            {
                id: "event5",
                label: "Refund Payment",
                role: "Finance",
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
            },
            {
                type: "milestone",
                source: "event2",
                target: "event4"
            }
        ]
    },
    
    // Project management workflow with all relation types
    example3: {
        events: [
            {
                id: "event1",
                label: "Define Project",
                role: "Project Manager",
                included: true,
                pending: false,
                executed: false,
                x: 150,
                y: 100
            },
            {
                id: "event2",
                label: "Assign Team",
                role: "HR",
                included: true,
                pending: false,
                executed: false,
                x: 350,
                y: 100
            },
            {
                id: "event3",
                label: "Create Schedule",
                role: "Project Manager",
                included: true,
                pending: false,
                executed: false,
                x: 550,
                y: 100
            },
            {
                id: "event4",
                label: "Execute Tasks",
                role: "Team",
                included: true,
                pending: false,
                executed: false,
                x: 350,
                y: 200
            },
            {
                id: "event5",
                label: "Project Review",
                role: "Stakeholders",
                included: true,
                pending: false,
                executed: false,
                x: 550,
                y: 200
            },
            {
                id: "event6",
                label: "Revise Project",
                role: "Project Manager",
                included: false,
                pending: false,
                executed: false,
                x: 150,
                y: 200
            },
            {
                id: "event7",
                label: "Close Project",
                role: "Project Manager",
                included: true,
                pending: false,
                executed: false,
                x: 350,
                y: 300
            }
        ],
        relations: [
            // Condition relations
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
                source: "event3",
                target: "event4"
            },
            
            // Response relations
            {
                type: "response",
                source: "event1",
                target: "event2"
            },
            {
                type: "response",
                source: "event2",
                target: "event3"
            },
            {
                type: "response",
                source: "event4",
                target: "event5"
            },
            
            // Include relations
            {
                type: "include",
                source: "event5",
                target: "event6"
            },
            {
                type: "include",
                source: "event6",
                target: "event2"
            },
            
            // Exclude relations
            {
                type: "exclude",
                source: "event7",
                target: "event4"
            },
            {
                type: "exclude",
                source: "event7",
                target: "event5"
            },
            {
                type: "exclude",
                source: "event7",
                target: "event6"
            },
            
            // Milestone relations
            {
                type: "milestone",
                source: "event5",
                target: "event7"
            },
            {
                type: "milestone",
                source: "event3",
                target: "event6"
            }
        ]
    },
    
    // Email workflow example (inspired by Image 2)
    example4: {
        events: [
            {
                id: "event1",
                label: "Create email",
                role: "Technical Employee",
                included: true,
                pending: false,
                executed: false,
                x: 100,
                y: 100
            },
            {
                id: "event2",
                label: "Send email",
                role: "Technical Employee",
                included: true,
                pending: false,
                executed: false,
                x: 300,
                y: 100
            },
            {
                id: "event3",
                label: "Receive Email",
                role: "SD",
                included: true,
                pending: false,
                executed: false,
                x: 500,
                y: 100
            },
            {
                id: "event4",
                label: "Reply",
                role: "SD",
                included: true,
                pending: false,
                executed: false,
                x: 700,
                y: 100
            },
            {
                id: "event5",
                label: "Ignore",
                role: "SD",
                included: true,
                pending: false,
                executed: false,
                x: 600,
                y: 200
            }
        ],
        relations: [
            // Condition relations
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
                source: "event3",
                target: "event4"
            },
            {
                type: "condition",
                source: "event3",
                target: "event5"
            },
            
            // Response relations
            {
                type: "response",
                source: "event4",
                target: "event2"
            },
            
            // Exclude relations
            {
                type: "exclude",
                source: "event4",
                target: "event5"
            },
            {
                type: "exclude",
                source: "event5",
                target: "event4"
            },
            
            // Milestone relations
            {
                type: "milestone",
                source: "event1",
                target: "event2"
            },
            {
                type: "milestone",
                source: "event2",
                target: "event3"
            },
            {
                type: "milestone",
                source: "event3",
                target: "event4"
            }
        ]
    }
};
