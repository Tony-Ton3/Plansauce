import Project from "../models/project.model.js";
import Task from "../models/task.model.js";
import UserProject from "../models/userProject.model.js";
import mongoose from "mongoose";

// get all projects for a user
export const getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    
    let userProject = await UserProject.findOne({ userId: req.user.id }).lean();
    
    return res.status(200).json({
      success: true,
      projects,
      currentProjectId: userProject ? userProject.currentProjectId : null
    });
  } catch (error) {
    console.error("Error getting user projects:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving projects",
      error: error.message
    });
  }
};

// get a specific project with its tasks
export const getProjectWithTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID"
      });
    }
    
    const project = await Project.findOne({ 
      _id: projectId,
      userId: req.user.id
    }).lean();
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }
    
    const tasks = await Task.find({
      projectId,
      userId: req.user.id
    }).sort({ order: 1 }).lean();
    
    await UserProject.findOneAndUpdate(
      { userId: req.user.id },
      { 
        userId: req.user.id,
        currentProjectId: projectId,
        $push: { 
          recentProjects: { 
            $each: [{ projectId, lastAccessed: new Date() }],
            $position: 0,
            $slice: 5 // Keep only the 5 most recent
          } 
        }
      },
      { upsert: true, new: true }
    );
    
    return res.status(200).json({
      success: true,
      project,
      tasks
    });
  } catch (error) {
    console.error("Error getting project with tasks:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving project",
      error: error.message
    });
  }
};

// set current project
export const setCurrentProject = async (req, res) => {
  try {
    const { projectId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID"
      });
    }
    
    const project = await Project.findOne({
      _id: projectId,
      userId: req.user.id
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or doesn't belong to the user"
      });
    }
    
    const userProject = await UserProject.findOneAndUpdate(
      { userId: req.user.id },
      { 
        userId: req.user.id,
        currentProjectId: projectId,
        $push: { 
          recentProjects: { 
            $each: [{ projectId, lastAccessed: new Date() }],
            $position: 0,
            $slice: 5
          }
        }
      },
      { upsert: true, new: true }
    );
    
    return res.status(200).json({
      success: true,
      currentProjectId: userProject.currentProjectId
    });
  } catch (error) {
    console.error("Error setting current project:", error);
    return res.status(500).json({
      success: false,
      message: "Error setting current project",
      error: error.message
    });
  }
};

// update task completion status
export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { completed } = req.body;
    
    const task = await Task.findOne({ 
      _id: taskId,
      userId: req.user.id
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }
    
    task.completed = completed;
    await task.save();
    
    return res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    console.error("Error updating task status:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating task",
      error: error.message
    });
  }
};

// update subtask completion status
export const updateSubtaskStatus = async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;
    const { completed } = req.body;
    
    const task = await Task.findOne({ 
      _id: taskId,
      userId: req.user.id
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }
    
    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: "Subtask not found"
      });
    }
    
    subtask.completed = completed;
    await task.save();
    
    return res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    console.error("Error updating subtask status:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating subtask",
      error: error.message
    });
  }
}; 