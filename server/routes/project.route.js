import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  getUserProjects,
  getProjectWithTasks,
  updateTaskStatus,
  updateSubtaskStatus,
  setCurrentProject
} from "../controllers/project.controllers.js";

const router = express.Router();

router.get("/", verifyToken, getUserProjects);
router.get("/:projectId", verifyToken, getProjectWithTasks);
router.post("/current", verifyToken, setCurrentProject);
router.patch("/tasks/:taskId", verifyToken, updateTaskStatus);
router.patch("/tasks/:taskId/subtasks/:subtaskId", verifyToken, updateSubtaskStatus);

export default router; 