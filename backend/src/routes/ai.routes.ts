import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middlewares/authenticate';

export const aiRouter = Router();
const ctrl = new AIController();

aiRouter.get('/recommendations', authenticate, asyncHandler(ctrl.recommendations));
aiRouter.post('/chat', authenticate, asyncHandler(ctrl.chat));
aiRouter.get('/semantic-search', asyncHandler(ctrl.semanticSearch));
aiRouter.get('/trending', asyncHandler(ctrl.trending));
