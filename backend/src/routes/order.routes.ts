import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate, authorize } from '../middlewares/authenticate';
import { UserRole } from '../constants/roles';

export const orderRouter = Router();
const ctrl = new OrderController();

orderRouter.use(authenticate);
orderRouter.post('/', asyncHandler(ctrl.create));
orderRouter.get('/', asyncHandler(ctrl.listUserOrders));
orderRouter.get('/:id', asyncHandler(ctrl.getById));
orderRouter.post('/:id/cancel', asyncHandler(ctrl.cancel));

orderRouter.patch(
  '/:id/status',
  authorize(UserRole.Admin, UserRole.Seller),
  asyncHandler(ctrl.updateStatus),
);
