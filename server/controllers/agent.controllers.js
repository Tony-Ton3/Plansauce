// import AgentInteraction from "../models/agent.model.js";
import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const API_URL = process.env.PYTHON_API_URL || "http://localhost:8000";
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

    console.log('Fetching tasks from Python server...');
    const response = await fetch(`${API_URL}/api/generate-tasks`, {
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
    console.log(`Received ${tasks.length} tasks from Python server`);

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

      console.log('Creating project...');
      const project = new Project({
        userId: req.user.id,
        name: projectName,
        description,
        projectType: result.project_type,
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
      console.log('Project saved successfully:', savedProject._id);

      // Prepare all task documents
      console.log('Preparing task documents...');
      const taskDocuments = tasks.map((task, i) => {
        const taskId = task.id || `task-${i + 1}`;
        console.log(`Processing task ${i + 1}/${tasks.length}:`, {
          originalId: task.id,
          assignedId: taskId,
          category: task.category || "setup",
          text: task.text.substring(0, 50) + "..."
        });

        return {
          userId: req.user.id,
          projectId: savedProject._id,
          taskId: taskId,
          id: taskId, // Ensure both id and taskId are the same
          text: task.text,
          completed: false,
          category: task.category || "setup",
          order: i,
          subtasks: task.subtasks?.map((subtask, j) => {
            const subtaskId = subtask.id || `subtask-${taskId}-${j + 1}`;
            return {
              id: subtaskId,
              text: subtask.text,
            };
          }) || [],
        };
      });

      // Save all tasks in parallel
      console.log(`Saving ${taskDocuments.length} tasks...`);
      try {
        const savedTasks = await Promise.all(
          taskDocuments.map(async taskDoc => {
            const task = new Task(taskDoc);
            const savedTask = await task.save();
            console.log(`Saved task:`, {
              taskId: savedTask.taskId,
              id: savedTask._id,
              category: savedTask.category
            });
            return savedTask;
          })
        );
        console.log(`Successfully saved ${savedTasks.length} tasks`);
        
        // Verify all tasks were saved
        const savedTaskCount = await Task.countDocuments({ projectId: savedProject._id });
        console.log(`Verified ${savedTaskCount} tasks in database for project ${savedProject._id}`);
        
        if (savedTaskCount !== tasks.length) {
          console.error(`Task count mismatch! Expected: ${tasks.length}, Saved: ${savedTaskCount}`);
          // Log details of all tasks for debugging
          const allSavedTasks = await Task.find({ projectId: savedProject._id }).select('taskId id category').lean();
          console.log('All saved tasks:', allSavedTasks);
        }

        // Add saved tasks to the result
        result.tasks = savedTasks.map(task => ({
          id: task.taskId, // Use taskId as the primary identifier
          _id: task._id,   // Include MongoDB _id for reference
          text: task.text,
          category: task.category,
          completed: task.completed,
          order: task.order,
          subtasks: task.subtasks
        }));

      } catch (error) {
        console.error('Error saving tasks:', error);
        // If task saving fails, delete the project to maintain consistency
        await Project.findByIdAndDelete(savedProject._id);
        throw new Error(`Failed to save tasks: ${error.message}`);
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

    Description: Write 3-4 sentences that expand on the original idea. Focus on the core purpose, 
    target users, and main value proposition. Do not restate the project type as it's already specified above.

    Features:
    - List core features based on the project's scope and complexity
    - Each feature should be a clear user-facing capability
    - Focus on MVP features only
    - Keep each point brief (5-8 words)
    - Include only the most essential features that align with the project's purpose

    Keep the total response under 250 words and focus on clarity over comprehensiveness. 
    Do not include arbitrary names or technical implementation details.
    
    IMPORTANT: The Project Type MUST be exactly one of the types listed above, with no additional notes, extensions, or variations.
    IMPORTANT: If description is random gibberish return "Try again, e.g. "A mobile workout tracker app where users can log exercises, track progress over time, and get recommendations for new routines based on their goals. Should include a calendar view and achievement badges.""`

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
