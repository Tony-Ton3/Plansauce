// import AgentInteraction from "../models/agent.model.js";
import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import UserProject from "../models/userProject.model.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const apiBaseUrl = "http://localhost:8000/api";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export const generateTasks = async (req, res, next) => {
  try {
    const { name, description, priority } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: "Project description is required",
      });
    }

    let techStack = [];
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
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const tasks = result.data || [];

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
        projectType: "web",
        priority: normalizedPriority,
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

    const prompt = `Enhance the following project idea by adding more details and specifics: "${description}". 
    Return a concise description (3-4 sentences) followed by:
    
    Key Features:
    - 3-4 bullet points (short phrases, not paragraphs)
    
    Keep the total response under 250 words and focus on clarity over comprehensiveness.`;

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
