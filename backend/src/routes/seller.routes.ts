import { Router } from 'express';
import { SellerController } from '../controllers/seller.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate, authorize } from '../middlewares/authenticate';
import { UserRole } from '../constants/roles';

export const sellerRouter = Router();
const ctrl = new SellerController();

sellerRouter.use(authenticate, authorize(UserRole.Seller, UserRole.Admin));
sellerRouter.get('/dashboard', asyncHandler(ctrl.dashboard));
sellerRouter.get('/books', asyncHandler(ctrl.listBooks));
sellerRouter.get('/orders', asyncHandler(ctrl.listOrders));
sellerRouter.get('/analytics', asyncHandler(ctrl.analytics));
