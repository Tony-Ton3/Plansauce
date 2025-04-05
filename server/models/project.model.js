import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  projectType: {
    type: String,
    default: 'web'
  },
  priority: {
    type: String,
    enum: ['Speed', 'Scalability', 'Learning'],
    default: 'Speed'
  }
}, { timestamps: true });

// Create index for efficient querying
ProjectSchema.index({ userId: 1 });

const Project = mongoose.model("Project", ProjectSchema);

export default Project; 