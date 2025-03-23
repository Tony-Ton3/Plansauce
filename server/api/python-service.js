const axios = require('axios');

// Base URL for the Python FastAPI server
const PYTHON_API_BASE_URL = 'http://localhost:8000/api';

/**
 * Service module for interacting with the Python FastAPI server
 */
class PythonService {
  /**
   * Check if the Python service is healthy and available
   * @returns {Promise<boolean>} True if service is healthy
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${PYTHON_API_BASE_URL}/health`);
      return response.status === 200 && response.data.status === 'healthy';
    } catch (error) {
      console.error('Python service health check failed:', error.message);
      return false;
    }
  }

  /**
   * Send a request to the echo endpoint (for testing)
   * @param {string} message - Message to echo
   * @returns {Promise<Object>} Echo response
   */
  async echo(message) {
    try {
      const response = await axios.post(`${PYTHON_API_BASE_URL}/echo`, {
        message
      });
      return response.data;
    } catch (error) {
      console.error('Python echo service error:', error.message);
      throw new Error(`Failed to call Python echo service: ${error.message}`);
    }
  }

  /**
   * In the future, this method would call the CrewAI endpoint
   * when it's implemented in the Python server
   * @param {Object} config - CrewAI configuration
   * @returns {Promise<Object>} CrewAI response
   */
  async runCrewAI(config) {
    try {
      // This would use the /api/run-crew endpoint once implemented
      const response = await axios.post(`${PYTHON_API_BASE_URL}/echo`, {
        message: 'CrewAI placeholder - This will be replaced with actual CrewAI integration'
      });
      
      // For now, return a mock response
      return {
        success: true,
        message: 'CrewAI integration placeholder',
        mockData: true,
        timestamp: new Date().toISOString(),
        echo: response.data.echo
      };
    } catch (error) {
      console.error('Python CrewAI service error:', error.message);
      throw new Error(`Failed to call Python CrewAI service: ${error.message}`);
    }
  }
}

module.exports = new PythonService(); 