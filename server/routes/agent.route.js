import express from 'express';
import {
    processWithPython,
    processWithCrewAI,
    checkPythonHealth,
} from '../controllers/agent.controllers.js';

const router = express.Router();

router.post('/process-with-python', processWithPython);
router.post('/crew-ai', processWithCrewAI);
router.get('/python-health', checkPythonHealth);

export default router;