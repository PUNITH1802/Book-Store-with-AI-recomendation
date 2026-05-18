import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate, authorize } from '../middlewares/authenticate';
import { UserRole } from '../constants/roles';

export const adminRouter = Router();
const ctrl = new AdminController();

adminRouter.use(authenticate, authorize(UserRole.Admin));
adminRouter.get('/users', asyncHandler(ctrl.listUsers));
adminRouter.patch('/users/:id/status', asyncHandler(ctrl.updateUserStatus));
adminRouter.get('/books/pending', asyncHandler(ctrl.pendingBooks));
adminRouter.patch('/books/:id/approve', asyncHandler(ctrl.approveBook));
adminRouter.get('/analytics', asyncHandler(ctrl.analytics));
adminRouter.get('/orders', asyncHandler(ctrl.listOrders));
