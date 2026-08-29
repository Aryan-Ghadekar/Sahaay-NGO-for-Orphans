import { Router } from 'express';
import * as volunteerController from '../controllers/volunteer.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const volunteerRoutes = Router();
volunteerRoutes.use(authenticate, requireRole('volunteer'));

volunteerRoutes.get('/profile', asyncHandler(volunteerController.getProfile));
volunteerRoutes.patch('/profile', asyncHandler(volunteerController.updateProfile));
volunteerRoutes.get('/recommended', asyncHandler(volunteerController.getRecommended));
volunteerRoutes.get('/events', asyncHandler(volunteerController.getAvailableEvents));
volunteerRoutes.get('/applications', asyncHandler(volunteerController.getApplications));
volunteerRoutes.post('/applications', asyncHandler(volunteerController.apply));
volunteerRoutes.get('/attendance', asyncHandler(volunteerController.getAttendance));
