
import express from 'express';
import { createRoom, joinRoom } from '../controllers/roomController.js';
import { authMiddleware } from '../middleware/authmiddleware.js';
const router = express();

router.post("/create",authMiddleware,  createRoom)
router.post("/join",authMiddleware,  joinRoom)

export default router