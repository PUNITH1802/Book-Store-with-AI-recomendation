import slugify from 'slugify';
import { Book, IBook } from '../models/Book';
import { ApiError } from '../utils/ApiError';
import { PaginationOptions, buildPaginationMeta } from '../utils/pagination';
import { getRedis } from '../config/redis';
import { logger } from '../utils/logger';

interface BookFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  language?: string;
  tags?: string[];
  seller?: string;
  isFeatured?: boolean;
  search?: string;
}

interface CreateBookInput {
  title: string;
  author: string;
  description: string;
  coverImage: string;
  images?: string[];
  price: number;
  discountPrice?: number;
  category: string;
  tags?: string[];
  language?: string;
  pages?: number;
  publisher?: string;
  publishedAt?: Date;
  stock: number;
  isbn?: string;
  sellerId: string;
}

export class BookService {
  private async bustCache(pattern: string): Promise<void> {
    try {
      const redis = getRedis();
      const keys = await redis.keys(pattern);
      if (keys.length) await redis.del(...keys);
    } catch {
      // cache failures are non-fatal
    }
  }

  async list(filters: BookFilters, pagination: PaginationOptions) {
    const query: Record<string, unknown> = { isApproved: true, isActive: true };

    if (filters.category) query.category = filters.category;
    if (filters.language) query.language = filters.language;
    if (filters.isFeatured !== undefined) query.isFeatured = filters.isFeatured;
    if (filters.seller) query.seller = filters.seller;
    if (filters.tags?.length) query.tags = { $in: filters.tags };
    if (filters.minRating) query.rating = { $gte: filters.minRating };

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) (query.price as Record<string, number>).$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) (query.price as Record<string, number>).$lte = filters.maxPrice;
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    const [books, total] = await Promise.all([
      Book.find(query)
        .sort(filters.search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .populate('seller', 'name avatar')
        .lean(),
      Book.countDocuments(query),
    ]);

    return { books, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
  }

  async getById(id: string): Promise<IBook> {
    const book = await Book.findOne({ _id: id, isApproved: true, isActive: true })
      .populate('seller', 'name avatar')
      .lean();
    if (!book) throw ApiError.notFound('Book not found');
    return book as IBook;
  }

  async getBySlug(slug: string): Promise<IBook> {
    const book = await Book.findOne({ slug, isApproved: true, isActive: true })
      .populate('seller', 'name avatar')
      .lean();
    if (!book) throw ApiError.notFound('Book not found');
    return book as IBook;
  }

  async create(input: CreateBookInput): Promise<IBook> {
    const baseSlug = slugify(input.title, { lower: true, strict: true });
    let slug = baseSlug;
    let attempt = 0;

    while (await Book.exists({ slug })) {
      slug = `${baseSlug}-${++attempt}`;
    }

    const book = await Book.create({ ...input, slug, seller: input.sellerId });
    await this.bustCache('books:*');
    return book;
  }

  async update(id: string, sellerId: string, data: Partial<CreateBookInput>): Promise<IBook> {
    const book = await Book.findOne({ _id: id, seller: sellerId });
    if (!book) throw ApiError.notFound('Book not found or not owned by you');

    Object.assign(book, data);
    await book.save();
    await this.bustCache('books:*');
    return book;
  }

  async remove(id: string): Promise<void> {
    const result = await Book.findByIdAndUpdate(id, { isActive: false });
    if (!result) throw ApiError.notFound('Book not found');
    await this.bustCache('books:*');
  }

  async getFeatured(): Promise<IBook[]> {
    const cacheKey = 'books:featured';
    try {
      const redis = getRedis();
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached) as IBook[];
    } catch { /* skip cache */ }

    const books = await Book.find({ isFeatured: true, isApproved: true, isActive: true })
      .sort({ rating: -1 })
      .limit(12)
      .lean();

    try {
      await getRedis().setex(cacheKey, 300, JSON.stringify(books));
    } catch { /* skip cache */ }

    return books as IBook[];
  }

  async getSimilar(bookId: string): Promise<IBook[]> {
    const book = await Book.findById(bookId).lean();
    if (!book) return [];

    return Book.find({
      _id: { $ne: bookId },
      category: book.category,
      isApproved: true,
      isActive: true,
    })
      .sort({ rating: -1 })
      .limit(6)
      .lean() as Promise<IBook[]>;
  }

  async getCategories(): Promise<string[]> {
    return Book.distinct('category', { isApproved: true, isActive: true });
  }

  async incrementSold(bookId: string, qty: number): Promise<void> {
    await Book.findByIdAndUpdate(bookId, {
      $inc: { sold: qty, stock: -qty },
    });
  }

  async updateRating(bookId: string): Promise<void> {
    const result = await Book.aggregate([
      { $match: { _id: bookId } },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'book',
          as: 'reviews',
        },
      },
      {
        $project: {
          avgRating: { $avg: '$reviews.rating' },
          reviewCount: { $size: '$reviews' },
        },
      },
    ]);

    if (result[0]) {
      await Book.findByIdAndUpdate(bookId, {
        rating: Math.round((result[0].avgRating ?? 0) * 10) / 10,
        reviewCount: result[0].reviewCount,
      });
    }
  }
}

function slugify(text: string, options: { lower: boolean; strict: boolean }): string {
  let slug = text;
  if (options.lower) slug = slug.toLowerCase();
  if (options.strict) slug = slug.replace(/[^a-z0-9\s-]/g, '');
  return slug.trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}
