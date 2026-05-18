import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middlewares/authenticate';
import express from 'express';

export const paymentRouter = Router();
const ctrl = new PaymentController();

paymentRouter.post('/intent', authenticate, asyncHandler(ctrl.createIntent));
paymentRouter.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  asyncHandler(ctrl.handleWebhook),
);
