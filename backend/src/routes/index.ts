import { Router } from 'express';
import { authRouter } from './auth.routes';
import { bookRouter } from './book.routes';
import { cartRouter } from './cart.routes';
import { orderRouter } from './order.routes';
import { reviewRouter } from './review.routes';
import { userRouter } from './user.routes';
import { aiRouter } from './ai.routes';
import { sellerRouter } from './seller.routes';
import { adminRouter } from './admin.routes';
import { paymentRouter } from './payment.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/books', bookRouter);
apiRouter.use('/cart', cartRouter);
apiRouter.use('/orders', orderRouter);
apiRouter.use('/reviews', reviewRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/ai', aiRouter);
apiRouter.use('/seller', sellerRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/payments', paymentRouter);
