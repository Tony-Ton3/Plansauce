import AgentInteraction from "../models/agent.model.js";
import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import UserProject from "../models/userProject.model.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";

const apiBaseUrl = 'http://localhost:8000/api';

// export const processWithPython = async (req, res, next) => {
//   const startTime = Date.now();
  
//   try {
//     // Check if Python service is available
//     const isHealthy = await checkPythonServiceHealth();
    
//     if (!isHealthy) {
//       return res.status(503).json({
//         success: false,
//         message: 'Python service is unavailable'
//       });
//     }
    
//     // Get message from request body
//     const { message } = req.body;
    
//     if (!message) {
//       return res.status(400).json({
//         success: false,
//         message: 'Message is required'
//       });
//     }
    
//     // Call Python echo endpoint
//     const response = await fetch(`${apiBaseUrl}/echo`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ message })
//     });
    
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
    
//     const result = await response.json();
//     const processingTime = Date.now() - startTime;
    
//     // Store the interaction in the database
//     if (req.user && req.user.id) {
//       const interaction = new AgentInteraction({
//         userId: req.user.id,
//         interactionType: 'echo',
//         input: { message },
//         output: result,
//         status: 'success',
//         processingTime,
//       });
      
//       await interaction.save();
//     }
    
//     return res.json({
//       success: true,
//       data: result,
//       processedByPython: true,
//       processingTime,
//     });
    
//   } catch (error) {
//     console.error('Error in processWithPython:', error);
    
//     // Store the error interaction if user is logged in
//     if (req.user && req.user.id) {
//       const processingTime = Date.now() - startTime;
//       const interaction = new AgentInteraction({
//         userId: req.user.id,
//         interactionType: 'echo',
//         input: req.body,
//         output: {},
//         status: 'error',
//         errorMessage: error.message,
//         processingTime,
//       });
      
//       await interaction.save();
//     }
    
//     return res.status(500).json({
//       success: false,
//       message: 'Error processing with Python service',
//       error: error.message
//     });
//   }
// };

export const generateTasks = async (req, res, next) => {
  try {
    const { description, projectType, scale, features, timeline, useAI } = req.body;
    
    // Validate required fields
    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Project description is required'
      });
    }
    
    console.log(`Sending request to Python server with data:`, req.body);
    
    // get user's tech stack if useAI is false
    let techStack = [];
    
    if (useAI === false && req.user) {
      try {
        // get user's tech stack from database
        const user = await User.findById(req.user.id);
        if (user && user.background && Array.isArray(user.background.known_tech)) {
          techStack = user.background.known_tech;
          console.log("Using user's known technologies:", techStack);
        }
      } catch (err) {
        console.error("Error fetching user background:", err);
      }
    }
    
    // Call the CrewAI task generation endpoint
    const response = await fetch(`${apiBaseUrl}/generate-tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        projectDescription: description,
        projectType: projectType || 'web',
        scale: scale || 'small',
        features: features || [],
        timeline: timeline || 'flexible',
        techStack: techStack,
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Python API response error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    // Parse the response from Python
    const result = await response.json();
    console.log("Response from Python server:", result);
    
    // Extract tasks from the result
    let tasks = [];
    if (result.data && Array.isArray(result.data)) {
      tasks = result.data;
    } else if (result.tasks && Array.isArray(result.tasks)) {
      tasks = result.tasks;
    } else if (Array.isArray(result)) {
      tasks = result;
    }
    
    // If user is logged in and we have tasks, save them to the database
    if (req.user && tasks.length > 0) {
      try {
        // First, create a new project
        const projectName = description.substring(0, 50) + (description.length > 50 ? '...' : '');
        
        const project = new Project({
          userId: req.user.id,
          name: projectName,
          description: description,
          projectType: projectType || 'web',
          scale: scale || 'small',
          features: features || [],
          timeline: timeline || 'flexible'
        });
        
        const savedProject = await project.save();
        console.log(`Created new project with ID: ${savedProject._id}`);
        
        // Then create tasks associated with this project
        const savedTasks = [];
        for (let i = 0; i < tasks.length; i++) {
          const task = tasks[i];
          const newTask = new Task({
            userId: req.user.id,
            projectId: savedProject._id,
            taskId: task.id || `task-${i + 1}`,
            text: task.text,
            completed: Boolean(task.completed),
            order: i,
            subtasks: Array.isArray(task.subtasks) 
              ? task.subtasks.map((subtask, j) => ({
                  id: subtask.id || `subtask-${i + 1}-${j + 1}`,
                  text: subtask.text,
                  completed: Boolean(subtask.completed)
                })) 
              : []
          });
          
          const savedTask = await newTask.save();
          savedTasks.push(savedTask);
        }
        
        console.log(`Saved ${savedTasks.length} tasks for project ${savedProject._id}`);
        
        result.projectId = savedProject._id;
        result.projectName = savedProject.name;
      } catch (err) {
        console.error("Error saving project and tasks:", err);
      }
    }
    
    return res.json(result);
    
  } catch (error) {
    console.error('Error in generateTasks:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error generating tasks',
      error: error.message
    });
  }
};