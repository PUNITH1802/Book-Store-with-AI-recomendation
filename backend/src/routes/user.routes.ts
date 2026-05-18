import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middlewares/authenticate';

export const userRouter = Router();
const ctrl = new UserController();

userRouter.use(authenticate);
userRouter.get('/profile', asyncHandler(ctrl.getProfile));
userRouter.patch('/profile', asyncHandler(ctrl.updateProfile));
userRouter.get('/wishlist', asyncHandler(ctrl.getWishlist));
userRouter.post('/wishlist/:bookId', asyncHandler(ctrl.toggleWishlist));
userRouter.get('/addresses', asyncHandler(ctrl.getAddresses));
userRouter.post('/addresses', asyncHandler(ctrl.addAddress));
userRouter.delete('/addresses/:id', asyncHandler(ctrl.removeAddress));
