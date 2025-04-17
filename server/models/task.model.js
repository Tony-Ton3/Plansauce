import mongoose from "mongoose";

const SubtaskSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const TaskSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  taskId: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['planning', 'setup', 'backend', 'frontend', 'testing', 'deploy', 'maintain'],
    default: 'planning'
  },
  subtasks: {
    type: [SubtaskSchema],
    default: []
  },
  createdBy: {
    type: String,
    enum: ['user', 'crewai'],
    default: 'user'
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Create indexes for efficient querying
TaskSchema.index({ projectId: 1, taskId: 1 }, { unique: true });
TaskSchema.index({ userId: 1, completed: 1 });

const Task = mongoose.model("Task", TaskSchema);

export default Task; 