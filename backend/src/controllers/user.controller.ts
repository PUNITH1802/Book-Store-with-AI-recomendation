import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { Book } from '../models/Book';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';

export class UserController {
  getProfile = async (req: Request, res: Response): Promise<void> => {
    const user = await User.findById(req.user!.sub).lean();
    if (!user) throw ApiError.notFound('User not found');
    ApiResponse.success(res, user);
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    const input = z
      .object({
        name: z.string().min(2).max(100).optional(),
        avatar: z.string().url().optional(),
      })
      .parse(req.body);

    const user = await User.findByIdAndUpdate(req.user!.sub, input, { new: true }).lean();
    ApiResponse.success(res, user, 'Profile updated');
  };

  getWishlist = async (req: Request, res: Response): Promise<void> => {
    const user = await User.findById(req.user!.sub).populate('wishlist', 'title coverImage price discountPrice rating slug').lean();
    ApiResponse.success(res, user?.wishlist ?? []);
  };

  toggleWishlist = async (req: Request, res: Response): Promise<void> => {
    const { bookId } = req.params;
    const book = await Book.findById(bookId);
    if (!book) throw ApiError.notFound('Book not found');

    const user = await User.findById(req.user!.sub);
    if (!user) throw ApiError.notFound('User not found');

    const idx = user.wishlist.findIndex((id) => id.toString() === bookId);
    let action: string;
    if (idx > -1) {
      user.wishlist.splice(idx, 1);
      action = 'removed';
    } else {
      user.wishlist.push(book._id as unknown as typeof user.wishlist[0]);
      action = 'added';
    }

    await user.save();
    ApiResponse.success(res, { action });
  };

  getAddresses = async (req: Request, res: Response): Promise<void> => {
    const user = await User.findById(req.user!.sub).select('addresses').lean();
    ApiResponse.success(res, user?.addresses ?? []);
  };

  addAddress = async (req: Request, res: Response): Promise<void> => {
    const address = z
      .object({
        label: z.string().default('Home'),
        line1: z.string().min(1),
        line2: z.string().optional(),
        city: z.string().min(1),
        state: z.string().min(1),
        postalCode: z.string().min(1),
        country: z.string().min(1),
        isDefault: z.boolean().default(false),
      })
      .parse(req.body);

    const user = await User.findByIdAndUpdate(
      req.user!.sub,
      { $push: { addresses: address } },
      { new: true },
    ).select('addresses');

    ApiResponse.success(res, user?.addresses ?? [], 'Address added');
  };

  removeAddress = async (req: Request, res: Response): Promise<void> => {
    await User.findByIdAndUpdate(req.user!.sub, {
      $pull: { addresses: { _id: req.params.id } },
    });
    ApiResponse.noContent(res);
  };
}
