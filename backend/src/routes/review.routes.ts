import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middlewares/authenticate';

export const reviewRouter = Router();
const ctrl = new ReviewController();

reviewRouter.get('/book/:bookId', asyncHandler(ctrl.listByBook));
reviewRouter.post('/', authenticate, asyncHandler(ctrl.create));
reviewRouter.patch('/:id', authenticate, asyncHandler(ctrl.update));
reviewRouter.delete('/:id', authenticate, asyncHandler(ctrl.remove));
