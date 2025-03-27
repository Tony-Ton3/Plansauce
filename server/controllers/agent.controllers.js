import AgentInteraction from "../models/agent.model.js";
import Task from "../models/task.model.js";
import mongoose from "mongoose";

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
  // const startTime = Date.now();
  
  try {
    const { projectDescription, techStack, projectType } = req.body;
    
    // Validate required fields
    if (!projectDescription) {
      return res.status(400).json({
        success: false,
        message: 'Project description is required'
      });
    }
    
    // Call the CrewAI task generation endpoint
    const response = await fetch(`${apiBaseUrl}/generate-tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        projectDescription,
        techStack: techStack || [],
        projectType: projectType || 'web'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    // const processingTime = Date.now() - startTime;
    
    // Return just the tasks without any database operations
    return res.json({
      success: true,
      data: result,
      // processingTime,
    });
    
  } catch (error) {
    console.error('Error in generateTasks:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error generating tasks',
      error: error.message
    });
  }
};