import AgentInteraction from "../models/agent.model.js";
import { errorHandler } from "../utils/error.js";

const apiBaseUrl = 'http://localhost:8000/api';

// Helper function to check the Python service health
const checkPythonServiceHealth = async () => {
  try {
    const response = await fetch(`${apiBaseUrl}/health`);
    const data = await response.json();
    return response.ok && data.status === 'healthy';
  } catch (error) {
    console.error('Python service health check failed:', error.message);
    return false;
  }
};

export const processWithPython = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    // Check if Python service is available
    const isHealthy = await checkPythonServiceHealth();
    
    if (!isHealthy) {
      return res.status(503).json({
        success: false,
        message: 'Python service is unavailable'
      });
    }
    
    // Get message from request body
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }
    
    // Call Python echo endpoint
    const response = await fetch(`${apiBaseUrl}/echo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    const processingTime = Date.now() - startTime;
    
    // Store the interaction in the database
    if (req.user && req.user.id) {
      const interaction = new AgentInteraction({
        userId: req.user.id,
        interactionType: 'echo',
        input: { message },
        output: result,
        status: 'success',
        processingTime,
      });
      
      await interaction.save();
    }
    
    return res.json({
      success: true,
      data: result,
      processedByPython: true,
      processingTime,
    });
    
  } catch (error) {
    console.error('Error in processWithPython:', error);
    
    // Store the error interaction if user is logged in
    if (req.user && req.user.id) {
      const processingTime = Date.now() - startTime;
      const interaction = new AgentInteraction({
        userId: req.user.id,
        interactionType: 'echo',
        input: req.body,
        output: {},
        status: 'error',
        errorMessage: error.message,
        processingTime,
      });
      
      await interaction.save();
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error processing with Python service',
      error: error.message
    });
  }
};

export const processWithCrewAI = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    // Check if Python service is available
    const isHealthy = await checkPythonServiceHealth();
    
    if (!isHealthy) {
      return res.status(503).json({
        success: false,
        message: 'Python service is unavailable'
      });
    }
    
    // Call the CrewAI functionality (this is a placeholder until actual endpoint is implemented)
    const response = await fetch(`${apiBaseUrl}/echo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'CrewAI placeholder - Will be replaced with actual integration'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const processingTime = Date.now() - startTime;
    
    // Mock response until CrewAI is implemented
    const result = {
      success: true,
      message: 'CrewAI integration placeholder',
      mockData: true,
      timestamp: new Date().toISOString(),
      echo: data.echo
    };
    
    // Store the interaction in the database
    if (req.user && req.user.id) {
      const interaction = new AgentInteraction({
        userId: req.user.id,
        interactionType: 'crewAI',
        input: req.body,
        output: result,
        status: 'success',
        processingTime,
      });
      
      await interaction.save();
    }
    
    return res.json({
      success: true,
      data: result,
      processedByCrewAI: !result.mockData,
      processingTime,
    });
    
  } catch (error) {
    console.error('Error in processWithCrewAI:', error);
    
    // Store the error interaction if user is logged in
    if (req.user && req.user.id) {
      const processingTime = Date.now() - startTime;
      const interaction = new AgentInteraction({
        userId: req.user.id,
        interactionType: 'crewAI',
        input: req.body,
        output: {},
        status: 'error',
        errorMessage: error.message,
        processingTime,
      });
      
      await interaction.save();
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error processing with CrewAI',
      error: error.message
    });
  }
};

export const checkPythonHealth = async(req, res, next) => {
  try {
    const isHealthy = await checkPythonServiceHealth();
    
    return res.json({
      success: true,
      healthy: isHealthy,
      service: 'python'
    });
    
  } catch (error) {
    console.error('Error checking Python health:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking Python service health',
      error: error.message
    });
  }
};
