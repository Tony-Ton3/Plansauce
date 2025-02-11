import mongoose from "mongoose";

const TechnologySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  documentationUrl: { type: String, required: true },
  prerequisites: { type: [String], required: true },
});

const StackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recommendedStack: {
      name: { type: String, required: true },
      technologies: [TechnologySchema],
      reasoning: { type: String, required: true },
    },
    alternativeStack: {
      name: { type: String, required: true },
      technologies: [TechnologySchema],
      reasoning: { type: String, required: true },
    },
    gettingStarted: { type: String, required: true },
    additionalAdvice: { type: String, required: true },
  },
  { timestamps: true }
);

const Stack = mongoose.model("Stack", StackSchema);

export default Stack;