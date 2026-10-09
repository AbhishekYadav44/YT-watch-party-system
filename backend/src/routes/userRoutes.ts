import express from 'express';
import { signinController, signupController } from '../controllers/userController.js';

const router = express.Router();

router.post("/signup", signupController);
router.post("/signin", signinController);

export default router;