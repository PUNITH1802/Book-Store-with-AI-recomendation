import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middlewares/authenticate';

export const cartRouter = Router();
const ctrl = new CartController();

cartRouter.use(authenticate);
cartRouter.get('/', asyncHandler(ctrl.getCart));
cartRouter.post('/items', asyncHandler(ctrl.addItem));
cartRouter.patch('/items/:bookId', asyncHandler(ctrl.updateQuantity));
cartRouter.delete('/items/:bookId', asyncHandler(ctrl.removeItem));
cartRouter.delete('/', asyncHandler(ctrl.clearCart));
