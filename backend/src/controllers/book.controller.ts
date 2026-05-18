import { Request, Response } from 'express';
import { z } from 'zod';
import { BookService } from '../services/book.service';
import { ApiResponse } from '../utils/ApiResponse';
import { parsePagination } from '../utils/pagination';

const bookService = new BookService();

const createBookSchema = z.object({
  title: z.string().min(1).max(300),
  author: z.string().min(1).max(200),
  description: z.string().min(10).max(5000),
  coverImage: z.string().url(),
  images: z.array(z.string().url()).optional(),
  price: z.number().positive(),
  discountPrice: z.number().positive().optional(),
  category: z.string().min(1),
  tags: z.array(z.string()).optional(),
  language: z.string().optional(),
  pages: z.number().positive().int().optional(),
  publisher: z.string().optional(),
  publishedAt: z.coerce.date().optional(),
  stock: z.number().int().nonnegative(),
  isbn: z.string().optional(),
});

export class BookController {
  list = async (req: Request, res: Response): Promise<void> => {
    const pagination = parsePagination(req);
    const { q: search, category, minPrice, maxPrice, minRating, language, tags, seller, featured } = req.query;

    const { books, meta } = await bookService.list(
      {
        search: search as string,
        category: category as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        minRating: minRating ? Number(minRating) : undefined,
        language: language as string,
        tags: tags ? (tags as string).split(',') : undefined,
        seller: seller as string,
        isFeatured: featured === 'true' ? true : undefined,
      },
      pagination,
    );

    ApiResponse.paginated(res, books, meta);
  };

  search = async (req: Request, res: Response): Promise<void> => {
    const { q } = req.query;
    const pagination = parsePagination(req);
    const { books, meta } = await bookService.list({ search: q as string }, pagination);
    ApiResponse.paginated(res, books, meta);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const book = await bookService.getById(req.params.id);
    ApiResponse.success(res, book);
  };

  featured = async (_req: Request, res: Response): Promise<void> => {
    const books = await bookService.getFeatured();
    ApiResponse.success(res, books);
  };

  categories = async (_req: Request, res: Response): Promise<void> => {
    const categories = await bookService.getCategories();
    ApiResponse.success(res, categories);
  };

  similar = async (req: Request, res: Response): Promise<void> => {
    const books = await bookService.getSimilar(req.params.id);
    ApiResponse.success(res, books);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const input = createBookSchema.parse(req.body);
    const book = await bookService.create({ ...input, sellerId: req.user!.sub });
    ApiResponse.created(res, book, 'Book submitted for review');
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const input = createBookSchema.partial().parse(req.body);
    const book = await bookService.update(req.params.id, req.user!.sub, input);
    ApiResponse.success(res, book, 'Book updated');
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await bookService.remove(req.params.id);
    ApiResponse.noContent(res);
  };
}
