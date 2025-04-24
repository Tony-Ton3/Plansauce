import express from 'express';
import {
    generateTasks,
    enhanceProjectIdea
} from '../controllers/agent.controllers.js';
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post('/generate-tasks', verifyToken, generateTasks);
router.post('/enhance-idea', verifyToken, enhanceProjectIdea);

export default router;