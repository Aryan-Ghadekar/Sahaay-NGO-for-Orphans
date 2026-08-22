import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const adminRoutes = Router();
adminRoutes.use(authenticate, requireRole('admin'));

adminRoutes.get('/overview', asyncHandler(adminController.getOverview));
adminRoutes.get('/team', asyncHandler(adminController.getTeam));
adminRoutes.post('/team', asyncHandler(adminController.createTeamMember));
adminRoutes.get('/content-blocks', asyncHandler(adminController.getContentBlocks));
adminRoutes.get('/impact-records/draft', asyncHandler(adminController.getImpactRecordDraft));
adminRoutes.post('/impact-records', asyncHandler(adminController.saveImpactRecord));
