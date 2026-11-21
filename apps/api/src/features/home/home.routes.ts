import { Router } from 'express';
import { homeController } from './home.controller.js';
import { authenticate } from '../../middleware/auth.js';

export const homeRouter = Router();

homeRouter.get('/dashboard', authenticate, homeController.getDashboard);
