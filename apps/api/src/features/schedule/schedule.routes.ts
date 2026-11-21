import { Router } from 'express';
import { scheduleController } from './schedule.controller.js';
import { authenticate } from '../../middleware/auth.js';

export const scheduleRouter = Router();

scheduleRouter.get('/weekly', authenticate, scheduleController.getWeekly);
scheduleRouter.get('/next', authenticate, scheduleController.getNextClass);
