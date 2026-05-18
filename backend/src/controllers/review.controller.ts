import { Request, Response } from 'express';
import { z } from 'zod';
import { Review } from '../models/Review';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { BookService } from '../services/book.service';
import { parsePagination } from '../utils/pagination';

const bookService = new BookService();

export class ReviewController {
  listByBook = async (req: Request, res: Response): Promise<void> => {
    const { bookId } = req.params;
    const pagination = parsePagination(req);

    const [reviews, total] = await Promise.all([
      Review.find({ book: bookId, isApproved: true })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Review.countDocuments({ book: bookId, isApproved: true }),
    ]);

    ApiResponse.paginated(res, reviews, {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    });
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const { bookId, rating, title, body } = z
      .object({
        bookId: z.string(),
        rating: z.number().int().min(1).max(5),
        title: z.string().min(1).max(150),
        body: z.string().min(10).max(2000),
      })
      .parse(req.body);

    const existing = await Review.findOne({ user: req.user!.sub, book: bookId });
    if (existing) throw ApiError.conflict('You have already reviewed this book');

    const review = await Review.create({
      user: req.user!.sub,
      book: bookId,
      rating,
      title,
      body,
    });

    await bookService.updateRating(bookId);

    ApiResponse.created(res, review, 'Review submitted');
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { rating, title, body } = z
      .object({
        rating: z.number().int().min(1).max(5).optional(),
        title: z.string().min(1).max(150).optional(),
        body: z.string().min(10).max(2000).optional(),
      })
      .parse(req.body);

    const review = await Review.findOne({ _id: req.params.id, user: req.user!.sub });
    if (!review) throw ApiError.notFound('Review not found');

    if (rating !== undefined) review.rating = rating;
    if (title) review.title = title;
    if (body) review.body = body;
    await review.save();

    await bookService.updateRating(review.book.toString());

    ApiResponse.success(res, review, 'Review updated');
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      user: req.user!.sub,
    });
    if (!review) throw ApiError.notFound('Review not found');
    await bookService.updateRating(review.book.toString());
    ApiResponse.noContent(res);
  };
}
