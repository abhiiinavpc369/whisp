// friend.routes.js
import express from 'express';
import * as friendController from './friend.controller.js';
import authMiddleware from '../../common/middleware/auth.middleware.js';

const router = express.Router();

router.post('/:userId/request', authMiddleware, friendController.sendRequest);
router.post('/:requestId/accept', authMiddleware, friendController.acceptRequest);
router.post('/:requestId/reject', authMiddleware, friendController.rejectRequest);
router.get('/', authMiddleware, friendController.getFriends);

export default router;  // ✅ ES module export
