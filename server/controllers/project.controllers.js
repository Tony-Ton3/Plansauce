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
    const { projectId, taskId } = req.params;
    const { completed } = req.body;
    
    // console.log('Updating task status:', { projectId, taskId, completed });

    let task = await Task.findOne({ 
      taskId: taskId,
      projectId: projectId,
      userId: req.user.id
    });

    if (!task) {
      task = await Task.findOne({
        _id: taskId,
        projectId: projectId,
        userId: req.user.id
      });
    }
    
    // if (!task) {
    //   console.error('Task not found:', { taskId, projectId });
    //   return res.status(404).json({
    //     success: false,
    //     message: "Task not found"
    //   });
    // }
    
    // console.log('Found task:', {
    //   taskId: task.taskId,
    //   _id: task._id,
    //   oldStatus: task.completed,
    //   newStatus: completed
    // });

    task.completed = completed;
    await task.save();
    
    console.log('Task updated successfully');

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

export const pinProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    project.pinned = !project.pinned;
    await project.save();
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    if (project.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this project" });
    }
    
    await project.deleteOne();
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
