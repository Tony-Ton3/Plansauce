import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    thumbnail: { type: String, required: true },
    channelTitle: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const UserTutorialsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stack",
      required: true,
    },
    stackTutorials: [VideoSchema],
  },
  { timestamps: true }
);

UserTutorialsSchema.index({ userId: 1, stackId: 1 }, { unique: true });

const UserTutorials = mongoose.model("UserTutorials", UserTutorialsSchema);

export default UserTutorials;