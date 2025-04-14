// import AgentInteraction from "../models/agent.model.js";
import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const apiBaseUrl = "http://localhost:8000/api";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export const generateTasks = async (req, res, next) => {
  try {
    const { name, description, priority } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: "Project description is required",
      });
    }

    let userBackground = {};

    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user?.background) {
        userBackground = user.background;
      }
    }

    const response = await fetch(`${apiBaseUrl}/generate-tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description,
        priority,
        background: {
          known_tech: userBackground?.known_tech || [],
          disliked_tech: userBackground?.disliked_tech || [],
          starred_tech: userBackground?.starred_tech || [],
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Validate and extract tasks
    if (!Array.isArray(result.data)) {
      throw new Error("Invalid tasks data received from server");
    }
    const tasks = result.data;

    // Validate and extract tech stack
    let tech_stack = {};
    try {
      tech_stack = result.tech_stack || {};
      if (typeof tech_stack === 'string') {
        tech_stack = JSON.parse(tech_stack);
      }
    } catch (error) {
      console.error("Error parsing tech stack:", error);
      tech_stack = {
        type: "Web Application",
        planning: [],
        setup: [],
        frontend: [],
        backend: [],
        testing: [],
        deploy: [],
        maintain: []
      };
    }

    if (tasks.length > 0) {
      const projectName =
        name ||
        description.substring(0, 50) + (description.length > 50 ? "..." : "");
      let normalizedPriority = priority;
      if (priority?.startsWith("Speed")) normalizedPriority = "Speed";
      if (priority?.startsWith("Scalability"))
        normalizedPriority = "Scalability";
      if (priority?.startsWith("Learning")) normalizedPriority = "Learning";

      const project = new Project({
        userId: req.user.id,
        name: projectName,
        description,
        projectType: tech_stack?.type || "Web Application",
        priority: normalizedPriority,
        techStack: {
          planning: tech_stack?.planning || [],
          setup: tech_stack?.setup || [],
          frontend: tech_stack?.frontend || [],
          backend: tech_stack?.backend || [],
          testing: tech_stack?.testing || [],
          deploy: tech_stack?.deploy || [],
          maintain: tech_stack?.maintain || []
        }
      });

      const savedProject = await project.save();

      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const newTask = new Task({
          userId: req.user.id,
          projectId: savedProject._id,
          taskId: task.id || `task-${i + 1}`,
          text: task.text,
          completed: false,
          category: task.category || "plan",
          order: i,
          subtasks:
            task.subtasks?.map((subtask, j) => ({
              id: subtask.id || `subtask-${i + 1}-${j + 1}`,
              text: subtask.text,
              completed: false,
            })) || [],
        });

        await newTask.save();
      }

      result.projectId = savedProject._id;
      result.projectName = savedProject.name;
    }

    return res.json(result);
  } catch (error) {
    console.error("Error in generateTasks:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating tasks",
      error: error.message,
    });
  }
};

export const enhanceProjectIdea = async (req, res, next) => {
  const startTime = Date.now();

  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
      });
    }

    const prompt = `Analyze and enhance the following project idea: "${description}"

    First, determine ONE of these project types based on the description:
    - Web Application
    - Mobile App
    - Browser Extension
    - CLI Tool
    - API/Backend Service
    - Data Analysis/ML Project
    - Game
    - Desktop Application
    - DevOps/Infrastructure Tool
    - Educational/Tutorial Project

    Provide your response in this exact format:

    Project Type: [EXACTLY ONE type from the list above, no extensions or notes]

    Enhanced Description: Write 3-4 sentences that expand on the original idea. Focus on the core purpose, 
    target users, and main value proposition. Be specific about the type of application and its primary interface.

    Key Features:
    - List 6-8 core features (not technical requirements)
    - Each feature should be a clear user-facing capability
    - Focus on MVP features first, then nice-to-haves
    - Keep each point brief (5-8 words)

    Keep the total response under 250 words and focus on clarity over comprehensiveness. 
    Do not include arbitrary names or technical implementation details.
    
    IMPORTANT: The Project Type MUST be exactly one of the types listed above, with no additional notes, extensions, or variations.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          topP: 0.95,
          topK: 40,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const enhancedDescription =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!enhancedDescription) {
      throw new Error("Invalid response format from Gemini API");
    }

    const featuresStart = enhancedDescription.indexOf("Key Features:");
    const featuresEnd = enhancedDescription.indexOf("Target Audience:");
    let suggestedFeatures = [];

    if (featuresStart !== -1 && featuresEnd !== -1) {
      const featuresText = enhancedDescription
        .substring(featuresStart + 12, featuresEnd)
        .trim();
      suggestedFeatures = featuresText
        .split("-")
        .map((feature) => feature.trim())
        .filter((feature) => feature.length > 0);
    }

    return res.json({
      success: true,
      enhancedDescription,
      suggestedFeatures,
      processingTime: Date.now() - startTime,
    });
  } catch (error) {
    console.error("Error enhancing project idea:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to enhance project idea. Please try again later.",
      error: error.message,
    });
  }
};
