//questions for the user for prompting purposes
export const projectQuestions = [
    {
      id: "projectOverview",
      title: "Project Overview",
      questions: [
        {
          id: "description",
          question: "Briefly describe your project idea:",
          type: "text",
        },
        {
          id: "projectType",
          question: "What type of project are you building?",
          type: "select",
          options: [
            "Web Application",
            "Mobile App",
            "Desktop Application",
            "API/Backend Service",
            "Other",
          ],
        },
        {
          id: "scale",
          question: "What's the expected scale of your project?",
          type: "select",
          options: [
            "Personal",
            "Small (1-1k users)",
            "Medium (1k-10k users)",
            "Large (10k+ users)",
          ],
        },
        {
          id: "techStack",
          question: "How would you like to choose your tech stack?",
          type: "radio",
          options: [
            "Use technologies I know",
            "Use AI recommendations",
          ],
        },
      ],
    },
    {
      id: "technicalRequirements",
      title: "Technical Requirements",
      questions: [
        {
          id: "features",
          question: "Select the key features you need:",
          type: "multiselect",
          options: [
            "User Authentication",
            "Database Storage",
            "Real-time Updates",
            "Payment Processing",
            "File Upload/Download",
            "API Integration",
            "None of these"
          ],
        },
        {
          id: "timeline",
          question: "What's your development timeline?",
          type: "select",
          options: ["Quick prototype", "1-3 months", "3-6 months", "6+ months", "No rush"],
        },
      ],
    },
    // {
    //   id: "userBackground",
    //   title: "Your Background",
    //   questions: [
    //     {
    //       id: "knownTechnologies",
    //       question: "Which technologies are you already familiar with?",
    //       type: "multiselect",
    //       options: [
    //         "JavaScript",
    //         "Python",
    //         "Java",
    //         "C#",
    //         "Ruby",
    //         "PHP",
    //         "Go",
    //         "React",
    //         "Angular",
    //         "Vue.js",
    //         "Node.js",
    //         "Django",
    //         "Ruby on Rails",
    //         "ASP.NET",
    //         "Spring Boot",
    //         "MySQL",
    //         "PostgreSQL",
    //         "MongoDB",
    //         "Docker",
    //         "AWS",
    //         "Other",
    //       ],
    //     },
    //     {
    //       id: "experience",
    //       question: "What's your programming experience level?",
    //       type: "select",
    //       options: [
    //         "Beginner (Can write basic code, learning fundamentals.)",
    //         "Intermediate (Builds full applications, understands best practices.)",
    //         "Advanced (Architects complex systems, deep expertise in multiple areas.)",
    //       ],
    //     },
    //   ],
    // },
  ];

//   export const projectQuestions = [
//     {
//         id: "project_type",
//         title: "Project Scope",
//         questions: [
//             {
//                 id: "description",
//                 question: "Describe your project in 1-2 sentences:",
//                 type: "text",
//                 placeholder: "e.g., 'A TikTok-style app for pet training videos'"
//             },
//             {
//                 id: "project_scale",
//                 question: "Target user base:",
//                 type: "select",
//                 options: [
//                     "1-100 users (Personal)",
//                     "100-10k users (Startup)",
//                     "10k+ users (Enterprise)"
//                 ]
//             }
//         ]
//     },
//     {
//         id: "tech_constraints",
//         title: "Technical Needs",
//         questions: [
//             {
//                 id: "must_have",
//                 question: "Essential technical requirements:",
//                 type: "multiselect",
//                 // Dynamically show/hide based on user's known_tech
//                 options: [
//                     "User Authentication",
//                     "Real-time Features",
//                     "Payment Processing",
//                     "AI/ML Integration",
//                     "Mobile App Stores"
//                 ]
//             },
//             {
//                 id: "avoid_tech",
//                 question: "Any technologies to avoid?",
//                 type: "multiselect",
//                 // Pre-populate with user's weak areas from registration
//                 options: ["PHP", "Java", "AWS", "Docker"]
//             }
//         ]
//     }
// ];