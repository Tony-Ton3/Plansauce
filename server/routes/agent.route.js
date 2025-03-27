import express from 'express';
import {
    //processWithPython,
    generateTasks
} from '../controllers/agent.controllers.js';
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();


// router.post('/process-with-python', processWithPython);
router.post('/generate-tasks', verifyToken, generateTasks);

export default router;