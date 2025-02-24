import express from "express";
import { getClaudeRecommendation } from "../controllers/recommendation.controllers.js";
import {
  getTutorialsForStack,
  getTutorialsForTechnology,
} from "../controllers/youtube.controllers.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post(
  "/claude-recommendation/:userId",
  verifyToken,
  getClaudeRecommendation
);
router.get(
  "/youtube/techtutorials/:technology",
  verifyToken,
  getTutorialsForTechnology
);
router.get(
  "/youtube/stacktutorials/:stackName/:stackId",
  verifyToken,
  getTutorialsForStack
);

export default router;