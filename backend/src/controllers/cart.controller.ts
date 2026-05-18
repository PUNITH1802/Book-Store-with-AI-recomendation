import { Request, Response } from 'express';
import { z } from 'zod';
import { Cart } from '../models/Cart';
import { Book } from '../models/Book';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';

export class CartController {
  getCart = async (req: Request, res: Response): Promise<void> => {
    const cart = await Cart.findOne({ user: req.user!.sub })
      .populate('items.book', 'title coverImage price discountPrice stock slug')
      .lean();
    ApiResponse.success(res, cart ?? { items: [] });
  };

  addItem = async (req: Request, res: Response): Promise<void> => {
    const { bookId, quantity = 1 } = z
      .object({ bookId: z.string(), quantity: z.number().int().positive().default(1) })
      .parse(req.body);

    const book = await Book.findOne({ _id: bookId, isApproved: true, isActive: true });
    if (!book) throw ApiError.notFound('Book not found');
    if (book.stock < quantity) throw ApiError.badRequest('Insufficient stock');

    const price = book.discountPrice ?? book.price;

    const cart = await Cart.findOneAndUpdate(
      { user: req.user!.sub, 'items.book': { $ne: bookId } },
      { $push: { items: { book: bookId, quantity, price } } },
      { new: true, upsert: true },
    );

    if (!cart) {
      // Item already in cart — update quantity
      await Cart.findOneAndUpdate(
        { user: req.user!.sub, 'items.book': bookId },
        { $inc: { 'items.$.quantity': quantity } },
      );
    }

    const updated = await Cart.findOne({ user: req.user!.sub })
      .populate('items.book', 'title coverImage price discountPrice stock slug')
      .lean();

    ApiResponse.success(res, updated, 'Item added to cart');
  };

  updateQuantity = async (req: Request, res: Response): Promise<void> => {
    const { quantity } = z.object({ quantity: z.number().int().positive() }).parse(req.body);
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book || book.stock < quantity) throw ApiError.badRequest('Insufficient stock');

    await Cart.findOneAndUpdate(
      { user: req.user!.sub, 'items.book': bookId },
      { $set: { 'items.$.quantity': quantity } },
    );

    ApiResponse.success(res, null, 'Quantity updated');
  };

  removeItem = async (req: Request, res: Response): Promise<void> => {
    await Cart.findOneAndUpdate(
      { user: req.user!.sub },
      { $pull: { items: { book: req.params.bookId } } },
    );
    ApiResponse.success(res, null, 'Item removed');
  };

  clearCart = async (req: Request, res: Response): Promise<void> => {
    await Cart.findOneAndUpdate({ user: req.user!.sub }, { $set: { items: [] } });
    ApiResponse.noContent(res);
  };
}
