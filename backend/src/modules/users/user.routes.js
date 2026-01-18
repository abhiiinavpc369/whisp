// user.routes.js
import express from 'express';
import * as userController from './users.controller.js';
import authMiddleware from '../../common/middleware/auth.middleware.js';

const router = express.Router();

// Get my profile
router.get('/me', authMiddleware, userController.getProfile);

// Update my profile
router.put('/me', authMiddleware, userController.updateProfile);

// Search for users
router.get('/search', authMiddleware, userController.searchUsers);

export default router; // ✅ default export
