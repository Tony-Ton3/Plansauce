import express from "express";
import { getClaudeRecommendation } from "../controllers/recommendation.controllers.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post(
  "/claude-recommendation/:userId",
  verifyToken,
  getClaudeRecommendation
);

export default router;