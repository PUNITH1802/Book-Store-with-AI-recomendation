import { Request, Response } from 'express';
import { Book } from '../models/Book';
import { Order } from '../models/Order';
import { ApiResponse } from '../utils/ApiResponse';
import { parsePagination } from '../utils/pagination';

export class SellerController {
  dashboard = async (req: Request, res: Response): Promise<void> => {
    const sellerId = req.user!.sub;

    const [totalBooks, activeBooks, totalOrders, revenueResult] = await Promise.all([
      Book.countDocuments({ seller: sellerId }),
      Book.countDocuments({ seller: sellerId, isActive: true, isApproved: true }),
      Order.countDocuments({ 'items.book': { $in: await Book.distinct('_id', { seller: sellerId }) } }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'books',
            localField: 'items.book',
            foreignField: '_id',
            as: 'bookInfo',
          },
        },
        { $match: { 'bookInfo.seller': sellerId } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      ]),
    ]);

    ApiResponse.success(res, {
      totalBooks,
      activeBooks,
      totalOrders,
      revenue: revenueResult[0]?.total ?? 0,
    });
  };

  listBooks = async (req: Request, res: Response): Promise<void> => {
    const pagination = parsePagination(req);
    const sellerId = req.user!.sub;

    const [books, total] = await Promise.all([
      Book.find({ seller: sellerId })
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Book.countDocuments({ seller: sellerId }),
    ]);

    ApiResponse.paginated(res, books, {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    });
  };

  listOrders = async (req: Request, res: Response): Promise<void> => {
    const sellerBooks = await Book.distinct('_id', { seller: req.user!.sub });
    const pagination = parsePagination(req);

    const [orders, total] = await Promise.all([
      Order.find({ 'items.book': { $in: sellerBooks } })
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .populate('user', 'name email')
        .lean(),
      Order.countDocuments({ 'items.book': { $in: sellerBooks } }),
    ]);

    ApiResponse.paginated(res, orders, {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    });
  };

  analytics = async (req: Request, res: Response): Promise<void> => {
    const sellerBooks = await Book.distinct('_id', { seller: req.user!.sub });

    const monthlySales = await Order.aggregate([
      { $match: { 'items.book': { $in: sellerBooks }, paymentStatus: 'paid' } },
      { $unwind: '$items' },
      { $match: { 'items.book': { $in: sellerBooks } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    ApiResponse.success(res, { monthlySales });
  };
}
