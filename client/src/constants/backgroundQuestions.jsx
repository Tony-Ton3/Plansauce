export const backgroundQuestions = [

    {
        id: "known_tech",
        question: "Which technologies are you already comfortable with?",
        type: "multiselect",
        options: [
            "JavaScript",
            "TypeScript",
            "React",
            "Next.js",
            "HTML/CSS",
            "Tailwind CSS",
            "Node.js",
            "Python",
            "Java",
            "Django",
            "MySQL",
            "PostgreSQL",
            "MongoDB",
            "Git",
            "Docker",
            "AWS",
            "GCP"
        ],
        suggestions: [
            // Frontend
            "Vue.js", "Angular", "Svelte", "Bootstrap", "Material-UI", "Chakra UI", 
            "Redux", "Zustand", "Framer Motion", "Styled-Components", "Sass", "Emotion",
            
            // Backend
            "Express", "FastAPI", "Flask", "Spring Boot", "Ruby on Rails", "ASP.NET Core",
            "GraphQL", "Socket.IO", "NestJS", "Laravel", "Hapi.js", "Koa", "Phoenix",
            
            // Database & Storage
            "Redis", "Firebase", "Supabase", "DynamoDB", "Cassandra", "ElasticSearch", "SQLite",
            
            // Deployment & DevOps
            "Vercel", "Netlify", "Kubernetes", "CI/CD", "Azure", "Heroku", "DigitalOcean",
            
            // Testing
            "Jest", "Cypress", "Playwright", "Mocha", "Chai",
            
            // AI/ML
            "OpenAI API", "LangChain", "TensorFlow", "PyTorch", "Hugging Face", "vLLM"
        ],
        allowCustomInput: true
    },
        // {
    //     id: "experience",
    //     question: "What's your programming experience level?",
    //     type: "select",
    //     options: [
    //         "Beginner (Can write basic code)",
    //         "Intermediate (Build full applications)",
    //         "Advanced (Architect complex systems)"
    //     ],
    //     // followUp: {
    //     //     if: "Beginner",
    //     //     ask: "Would you prefer no-code/low-code solutions when possible?",
    //     //     options: ["Yes", "No"]
    //     // }
    // },
    // {
    //     id: "time_commitment",
    //     question: "Weekly development hours available:",
    //     type: "slider",
    //     min: 2,
    //     max: 40,
    //     step: 1,
    //     labels: {
    //         2: "2h (Weekends)",
    //         20: "20h (Part-time)",
    //         40: "40h (Full-time)"
    //     }
    // },
    // {
    //     id: "risk_tolerance",
    //     question: "Do you prioritize:",
    //     type: "select",
    //     options: [
    //         "Speed (Ship fast, even if basic)",
    //         "Scalability (Build for future growth)",
    //         "Learning (Optimize for skill development)"
    //     ]
    // },
    // {
    //     id: "collaboration",
    //     question: "How will you work?",
    //     type: "select",
    //     options: [
    //         "Solo developer",
    //         "Small team (2-5 people)",
    //         "Large team (5+ people)"
    //     ]
    // }
];