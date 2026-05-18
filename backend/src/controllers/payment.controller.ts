import { Request, Response } from 'express';
import { z } from 'zod';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { Order } from '../models/Order';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export class PaymentController {
  createIntent = async (req: Request, res: Response): Promise<void> => {
    const { orderId } = z.object({ orderId: z.string() }).parse(req.body);

    const order = await Order.findOne({ _id: orderId, user: req.user!.sub });
    if (!order) throw ApiError.notFound('Order not found');

    if (!env.STRIPE_SECRET_KEY) {
      // Mock response for development
      ApiResponse.success(res, {
        clientSecret: `mock_pi_${orderId}_secret_dev`,
        amount: order.total,
      });
      return;
    }

    const stripe = (await import('stripe')).default;
    const stripeClient = new stripe(env.STRIPE_SECRET_KEY);

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(order.total * 100),
      currency: 'usd',
      metadata: { orderId: order._id.toString(), userId: req.user!.sub },
    });

    order.paymentIntentId = paymentIntent.id;
    await order.save();

    ApiResponse.success(res, { clientSecret: paymentIntent.client_secret, amount: order.total });
  };

  handleWebhook = async (req: Request, res: Response): Promise<void> => {
    if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
      res.json({ received: true });
      return;
    }

    const stripe = (await import('stripe')).default;
    const stripeClient = new stripe(env.STRIPE_SECRET_KEY);

    const sig = req.headers['stripe-signature'] as string;
    let event;

    try {
      event = stripeClient.webhooks.constructEvent(
        req.body as Buffer,
        sig,
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      logger.error('Stripe webhook signature failed', { error: (err as Error).message });
      throw ApiError.badRequest('Webhook signature verification failed');
    }

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as { id: string };
      await Order.findOneAndUpdate(
        { paymentIntentId: pi.id },
        { paymentStatus: 'paid', status: 'confirmed' },
      );
    }

    res.json({ received: true });
  };
}
