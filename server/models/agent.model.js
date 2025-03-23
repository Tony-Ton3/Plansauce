import mongoose from "mongoose";

const AgentInteractionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    interactionType: {
      type: String,
      enum: ["echo", "crewAI"],
      required: true,
    },
    input: {
      type: Object,
      required: true,
    },
    output: {
      type: Object,
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "error"],
      required: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    processingTime: {
      type: Number, // in milliseconds
      default: 0,
    },
  },
  { timestamps: true }
);

const AgentInteraction = mongoose.model("AgentInteraction", AgentInteractionSchema);

export default AgentInteraction; 