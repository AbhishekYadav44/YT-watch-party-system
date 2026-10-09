
import express from 'express';
import { createRoom } from '../controllers/roomController.js';
import { authMiddleware } from '../middleware/authmiddleware.js';
const router = express();

router.post("/create",authMiddleware,  createRoom)

export default router