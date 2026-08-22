import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const authRoutes = Router();

authRoutes.post('/login', asyncHandler(authController.login));
authRoutes.post('/signup', asyncHandler(authController.signup));
authRoutes.post('/logout', asyncHandler(authController.logout));
authRoutes.get('/me', authenticate, asyncHandler(authController.me));
