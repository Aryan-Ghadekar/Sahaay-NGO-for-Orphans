import { Router } from 'express';
import * as publicController from '../controllers/public.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const publicRoutes = Router();

publicRoutes.get('/impact-stats', asyncHandler(publicController.getImpactStats));
publicRoutes.get('/impact-breakdown', asyncHandler(publicController.getImpactBreakdown));
publicRoutes.get('/events', asyncHandler(publicController.getEvents));
publicRoutes.get('/programs', asyncHandler(publicController.getPrograms));
