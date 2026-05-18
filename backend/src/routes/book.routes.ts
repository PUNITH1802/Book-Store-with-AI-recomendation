import { Router } from 'express';
import { BookController } from '../controllers/book.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate, authorize } from '../middlewares/authenticate';
import { UserRole } from '../constants/roles';

export const bookRouter = Router();
const ctrl = new BookController();

bookRouter.get('/', asyncHandler(ctrl.list));
bookRouter.get('/search', asyncHandler(ctrl.search));
bookRouter.get('/featured', asyncHandler(ctrl.featured));
bookRouter.get('/categories', asyncHandler(ctrl.categories));
bookRouter.get('/:id', asyncHandler(ctrl.getById));
bookRouter.get('/:id/similar', asyncHandler(ctrl.similar));

bookRouter.post(
  '/',
  authenticate,
  authorize(UserRole.Seller, UserRole.Admin),
  asyncHandler(ctrl.create),
);
bookRouter.patch(
  '/:id',
  authenticate,
  authorize(UserRole.Seller, UserRole.Admin),
  asyncHandler(ctrl.update),
);
bookRouter.delete(
  '/:id',
  authenticate,
  authorize(UserRole.Admin),
  asyncHandler(ctrl.remove),
);
