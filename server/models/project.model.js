import mongoose from "mongoose";

const TechnologySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  docLink: {
    type: String,
    required: true
  }
}, { _id: false });

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
    required: true
  },
  priority: {
    type: String,
    enum: ['Speed', 'Scalability', 'Learning'],
    required: true
  },
  techStack: {
    planning: [TechnologySchema],
    setup: [TechnologySchema],
    frontend: [TechnologySchema],
    backend: [TechnologySchema],
    testing: [TechnologySchema],
    deploy: [TechnologySchema],
    maintain: [TechnologySchema]
  }
}, { timestamps: true });

// Create index for efficient querying
ProjectSchema.index({ userId: 1 });

const Project = mongoose.model("Project", ProjectSchema);

export default Project; 