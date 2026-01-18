// message.routes.js
import express from 'express';
import * as messageController from './message.controller.js';
import authMiddleware from '../../common/middleware/auth.middleware.js';

const router = express.Router();

router.get('/:friendId', authMiddleware, messageController.getMessages);
router.post('/:friendId', authMiddleware, messageController.sendMessage);

export default router;  // ✅ ES module export
