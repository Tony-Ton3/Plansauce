import mongoose from "mongoose";

const UserProjectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  currentProjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    default: null
  },
  recentProjects: [{
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project"
    },
    lastAccessed: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

UserProjectSchema.index({ userId: 1 }, { unique: true });

const UserProject = mongoose.model("UserProject", UserProjectSchema);

export default UserProject; 