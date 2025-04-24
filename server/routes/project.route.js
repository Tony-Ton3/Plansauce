import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  getUserProjects,
  getProjectWithTasks,
  updateTaskStatus,
  setCurrentProject,
  pinProject,
  deleteProject,
} from "../controllers/project.controllers.js";

const router = express.Router();

router.get("/", verifyToken, getUserProjects);
router.get("/:projectId", verifyToken, getProjectWithTasks);
router.post("/current", verifyToken, setCurrentProject);
router.patch("/:projectId/tasks/:taskId", verifyToken, updateTaskStatus);
router.put ("/:projectId/pin", verifyToken, pinProject);
router.delete ("/:projectId/delete", verifyToken, deleteProject);

export default router; 