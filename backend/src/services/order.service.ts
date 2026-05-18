import { Order, IOrder } from '../models/Order';
import { Cart } from '../models/Cart';
import { Book } from '../models/Book';
import { Coupon } from '../models/Coupon';
import { ApiError } from '../utils/ApiError';
import { OrderStatus } from '../constants/orderStatus';
import { emitToUser } from '../config/socket';
import { emailQueue } from '../queues/email.queue';
import { PaginationOptions, buildPaginationMeta } from '../utils/pagination';
import mongoose from 'mongoose';

interface CreateOrderInput {
  userId: string;
  shippingAddress: IOrder['shippingAddress'];
  couponCode?: string;
  notes?: string;
}

export class OrderService {
  async create(input: CreateOrderInput): Promise<IOrder> {
    const cart = await Cart.findOne({ user: input.userId }).populate('items.book');
    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest('Cart is empty');
    }

    // Validate stock for all items
    for (const item of cart.items) {
      const book = await Book.findById(item.book);
      if (!book || book.stock < item.quantity) {
        throw ApiError.badRequest(`Insufficient stock for "${book?.title ?? 'item'}"`);
      }
    }

    let subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    let discount = 0;

    if (input.couponCode) {
      const coupon = await Coupon.findOne({ code: input.couponCode.toUpperCase(), isActive: true });
      if (coupon && coupon.expiresAt > new Date() && coupon.usedCount < coupon.usageLimit) {
        if (subtotal >= coupon.minOrderAmount) {
          discount =
            coupon.type === 'percentage'
              ? Math.min(subtotal * (coupon.value / 100), coupon.maxDiscount ?? Infinity)
              : coupon.value;
          await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
        }
      }
    }

    const tax = (subtotal - discount) * 0.08;
    const total = subtotal - discount + tax;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const orderItems = cart.items.map((item) => ({
        book: item.book,
        title: (item.book as unknown as { title: string }).title,
        coverImage: (item.book as unknown as { coverImage: string }).coverImage,
        price: item.price,
        quantity: item.quantity,
      }));

      const [order] = await Order.create(
        [
          {
            user: input.userId,
            items: orderItems,
            subtotal,
            discount,
            tax: Math.round(tax * 100) / 100,
            total: Math.round(total * 100) / 100,
            shippingAddress: input.shippingAddress,
            couponCode: input.couponCode,
            notes: input.notes,
            statusHistory: [{ status: OrderStatus.Pending, timestamp: new Date() }],
          },
        ],
        { session },
      );

      // Decrement stock
      for (const item of cart.items) {
        await Book.findByIdAndUpdate(
          item.book,
          { $inc: { stock: -item.quantity, sold: item.quantity } },
          { session },
        );
      }

      await Cart.findByIdAndUpdate(cart._id, { $set: { items: [] } }, { session });

      await session.commitTransaction();

      emitToUser(input.userId, 'order:created', { orderId: order._id, total: order.total });
      await emailQueue.add('order-confirmation', { userId: input.userId, orderId: order._id });

      return order;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async listByUser(userId: string, pagination: PaginationOptions) {
    const [orders, total] = await Promise.all([
      Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Order.countDocuments({ user: userId }),
    ]);
    return { orders, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
  }

  async getById(id: string, userId?: string): Promise<IOrder> {
    const query: Record<string, unknown> = { _id: id };
    if (userId) query.user = userId;

    const order = await Order.findOne(query).populate('items.book', 'title coverImage slug').lean();
    if (!order) throw ApiError.notFound('Order not found');
    return order as IOrder;
  }

  async cancel(id: string, userId: string): Promise<IOrder> {
    const order = await Order.findOne({ _id: id, user: userId });
    if (!order) throw ApiError.notFound('Order not found');

    if (![OrderStatus.Pending, OrderStatus.Confirmed].includes(order.status)) {
      throw ApiError.badRequest('Order cannot be cancelled at this stage');
    }

    order.status = OrderStatus.Cancelled;
    order.statusHistory.push({ status: OrderStatus.Cancelled, timestamp: new Date() });

    // Restore stock
    for (const item of order.items) {
      await Book.findByIdAndUpdate(item.book, {
        $inc: { stock: item.quantity, sold: -item.quantity },
      });
    }

    await order.save();
    emitToUser(userId, 'order:cancelled', { orderId: order._id });
    return order;
  }

  async updateStatus(id: string, status: OrderStatus, note?: string): Promise<IOrder> {
    const order = await Order.findById(id);
    if (!order) throw ApiError.notFound('Order not found');

    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date(), note });
    await order.save();

    emitToUser(order.user.toString(), 'order:status-updated', { orderId: id, status });
    return order;
  }
}
