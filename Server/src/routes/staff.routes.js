import { Router } from 'express';
import * as staffController from '../controllers/staff.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const staffRoutes = Router();
staffRoutes.use(authenticate, requireRole('staff', 'admin'));

staffRoutes.get('/overview', asyncHandler(staffController.getOverview));
staffRoutes.get('/assignments/queue', asyncHandler(staffController.getAssignmentQueue));
staffRoutes.post('/assignments', asyncHandler(staffController.assign));
staffRoutes.get('/orphans', asyncHandler(staffController.getOrphanRecords));
staffRoutes.get('/volunteers', asyncHandler(staffController.getVolunteers));
staffRoutes.get('/programs', asyncHandler(staffController.getPrograms));
staffRoutes.get('/events', asyncHandler(staffController.getEvents));
staffRoutes.get('/assignments/all', asyncHandler(staffController.getAllAssignments));
staffRoutes.get('/attendance', asyncHandler(staffController.getAttendanceQueue));
staffRoutes.post('/attendance', asyncHandler(staffController.markAttendance));
staffRoutes.post('/certificates', asyncHandler(staffController.issueCertificate));
