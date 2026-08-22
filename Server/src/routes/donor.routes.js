import { Router } from 'express';
import * as donorController from '../controllers/donor.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const donorRoutes = Router();
donorRoutes.use(authenticate, requireRole('donor'));

donorRoutes.get('/summary', asyncHandler(donorController.getSummary));
donorRoutes.get('/donations', asyncHandler(donorController.getHistory));
donorRoutes.get('/impact-flow', asyncHandler(donorController.getImpactFlow));
donorRoutes.post('/donations', asyncHandler(donorController.createDonation));
