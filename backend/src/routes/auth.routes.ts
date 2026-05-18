import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middlewares/authenticate';

export const authRouter = Router();
const ctrl = new AuthController();

authRouter.post('/register', asyncHandler(ctrl.register));
authRouter.post('/login', asyncHandler(ctrl.login));
authRouter.post('/logout', authenticate, asyncHandler(ctrl.logout));
authRouter.post('/refresh', asyncHandler(ctrl.refresh));
authRouter.post('/forgot-password', asyncHandler(ctrl.forgotPassword));
authRouter.post('/reset-password', asyncHandler(ctrl.resetPassword));
authRouter.post('/verify-email', asyncHandler(ctrl.verifyEmail));
authRouter.get('/me', authenticate, asyncHandler(ctrl.me));
