// Quiz questions for user profile and preferences
// export const quizQuestions = [
//     {
//         id: "experience",
//         question: "What's your programming experience level?",
//         options: [
//             { value: "beginner", label: "Beginner (< 1 year)" },
//             { value: "intermediate", label: "Intermediate (1-3 years)" },
//             { value: "advanced", label: "Advanced (3-5 years)" },
//             { value: "expert", label: "Expert (5+ years)" }
//         ]
//     },
//     {
//         id: "interests",
//         question: "What areas of development interest you the most?",
//         options: [
//             { value: "frontend", label: "Frontend Development" },
//             { value: "backend", label: "Backend Development" },
//             { value: "fullstack", label: "Full Stack Development" },
//             { value: "mobile", label: "Mobile App Development" },
//             { value: "data", label: "Data Science / Machine Learning" }
//         ],
//         multiSelect: true
//     },
//     {
//         id: "goals",
//         question: "What are your learning goals?",
//         options: [
//             { value: "career", label: "Start a career in tech" },
//             { value: "skills", label: "Improve my current skills" },
//             { value: "project", label: "Build a specific project" },
//             { value: "hobby", label: "Learn as a hobby" }
//         ]
//     },
//     {
//         id: "time",
//         question: "How much time can you dedicate to learning each week?",
//         options: [
//             { value: "minimal", label: "Less than 5 hours" },
//             { value: "moderate", label: "5-10 hours" },
//             { value: "significant", label: "10-20 hours" },
//             { value: "fulltime", label: "20+ hours" }
//         ]
//     }

// ]; 


export const quizQuestions = [
    {
        id: "experience",
        question: "What's your programming experience level?",
        options: [
            "Beginner (Can write basic code)",
            "Intermediate (Build full applications)",
            "Advanced (Architect complex systems)"
        ],
        // Maps directly to technical debt tolerance
        followUp: {
            if: "Beginner",
            ask: "Would you prefer no-code/low-code solutions when possible?",
            options: ["Yes", "No"]
        }
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