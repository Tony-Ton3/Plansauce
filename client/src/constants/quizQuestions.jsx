// Quiz questions for user profile and preferences
export const quizQuestions = [
    {
        id: "experience",
        question: "What's your programming experience level?",
        options: [
            { value: "beginner", label: "Beginner (< 1 year)" },
            { value: "intermediate", label: "Intermediate (1-3 years)" },
            { value: "advanced", label: "Advanced (3-5 years)" },
            { value: "expert", label: "Expert (5+ years)" }
        ]
    },
    {
        id: "interests",
        question: "What areas of development interest you the most?",
        options: [
            { value: "frontend", label: "Frontend Development" },
            { value: "backend", label: "Backend Development" },
            { value: "fullstack", label: "Full Stack Development" },
            { value: "mobile", label: "Mobile App Development" },
            { value: "data", label: "Data Science / Machine Learning" }
        ],
        multiSelect: true
    },
    {
        id: "goals",
        question: "What are your learning goals?",
        options: [
            { value: "career", label: "Start a career in tech" },
            { value: "skills", label: "Improve my current skills" },
            { value: "project", label: "Build a specific project" },
            { value: "hobby", label: "Learn as a hobby" }
        ]
    },
    {
        id: "time",
        question: "How much time can you dedicate to learning each week?",
        options: [
            { value: "minimal", label: "Less than 5 hours" },
            { value: "moderate", label: "5-10 hours" },
            { value: "significant", label: "10-20 hours" },
            { value: "fulltime", label: "20+ hours" }
        ]
    }
]; 