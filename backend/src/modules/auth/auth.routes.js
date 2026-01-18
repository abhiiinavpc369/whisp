import express from 'express';
import { googleAuthController } from './auth.controller.js';

const router = express.Router();

router.post('/google', googleAuthController);

export default router;
