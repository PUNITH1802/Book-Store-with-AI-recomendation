import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { Book } from '../models/Book';
import { Order } from '../models/Order';
import { ApiResponse } from '../utils/ApiResponse';
import { parsePagination } from '../utils/pagination';

export class AdminController {
  listUsers = async (req: Request, res: Response): Promise<void> => {
    const pagination = parsePagination(req);
    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit).lean(),
      User.countDocuments(),
    ]);
    ApiResponse.paginated(res, users, {
      page: pagination.page, limit: pagination.limit, total,
      totalPages: Math.ceil(total / pagination.limit),
    });
  };

  updateUserStatus = async (req: Request, res: Response): Promise<void> => {
    const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
    await User.findByIdAndUpdate(req.params.id, { isActive });
    ApiResponse.success(res, null, `User ${isActive ? 'activated' : 'deactivated'}`);
  };

  pendingBooks = async (req: Request, res: Response): Promise<void> => {
    const pagination = parsePagination(req);
    const [books, total] = await Promise.all([
      Book.find({ isApproved: false, isActive: true })
        .populate('seller', 'name email')
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Book.countDocuments({ isApproved: false, isActive: true }),
    ]);
    ApiResponse.paginated(res, books, {
      page: pagination.page, limit: pagination.limit, total,
      totalPages: Math.ceil(total / pagination.limit),
    });
  };

  approveBook = async (req: Request, res: Response): Promise<void> => {
    const { approved } = z.object({ approved: z.boolean() }).parse(req.body);
    await Book.findByIdAndUpdate(req.params.id, { isApproved: approved });
    ApiResponse.success(res, null, `Book ${approved ? 'approved' : 'rejected'}`);
  };

  analytics = async (_req: Request, res: Response): Promise<void> => {
    const [totalUsers, totalBooks, totalOrders, revenueResult] = await Promise.all([
      User.countDocuments(),
      Book.countDocuments({ isApproved: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    const monthlySales = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    ApiResponse.success(res, {
      totalUsers,
      totalBooks,
      totalOrders,
      totalRevenue: revenueResult[0]?.total ?? 0,
      monthlySales,
    });
  };

  listOrders = async (req: Request, res: Response): Promise<void> => {
    const pagination = parsePagination(req);
    const [orders, total] = await Promise.all([
      Order.find()
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .populate('user', 'name email')
        .lean(),
      Order.countDocuments(),
    ]);
    ApiResponse.paginated(res, orders, {
      page: pagination.page, limit: pagination.limit, total,
      totalPages: Math.ceil(total / pagination.limit),
    });
  };
}
