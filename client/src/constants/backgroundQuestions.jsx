export const backgroundQuestions = [
    {
        id: "experience",
        question: "What's your programming experience level?",
        type: "select",
        options: [
            "Beginner (Can write basic code)",
            "Intermediate (Build full applications)",
            "Advanced (Architect complex systems)"
        ],
        // followUp: {
        //     if: "Beginner",
        //     ask: "Would you prefer no-code/low-code solutions when possible?",
        //     options: ["Yes", "No"]
        // }
    },
    {
        id: "known_tech",
        question: "Which technologies are you already comfortable with?",
        type: "multiselect",
        options: [
            "JavaScript", "Python", "Java", "C#", "React", 
            "Node.js", "Django", "MySQL", "Docker", "AWS"
        ],
        // Used to avoid recommending unfamiliar tech
        allowCustomInput: true
    },
    {
        id: "time_commitment",
        question: "Weekly development hours available:",
        type: "slider",
        min: 2,
        max: 40,
        step: 5,
        labels: {
            2: "2h (Weekends)",
            20: "20h (Part-time)",
            40: "40h (Full-time)"
        }
    },
    {
        id: "risk_tolerance",
        question: "Do you prioritize:",
        type: "select",
        options: [
            "Speed (Ship fast, even if basic)",
            "Scalability (Build for future growth)",
            "Learning (Optimize for skill development)"
        ]
    },
    {
        id: "collaboration",
        question: "How will you work?",
        type: "select",
        options: [
            "Solo developer",
            "Small team (2-5 people)",
            "Large team (5+ people)"
        ]
    }
];