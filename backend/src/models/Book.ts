import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  title: string;
  slug: string;
  author: string;
  isbn?: string;
  description: string;
  coverImage: string;
  images: string[];
  price: number;
  discountPrice?: number;
  category: string;
  tags: string[];
  language: string;
  pages?: number;
  publisher?: string;
  publishedAt?: Date;
  stock: number;
  sold: number;
  rating: number;
  reviewCount: number;
  seller: mongoose.Types.ObjectId;
  isApproved: boolean;
  isActive: boolean;
  isFeatured: boolean;
  embedding?: number[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true, index: 'text' },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    author: { type: String, required: true, trim: true, index: 'text' },
    isbn: { type: String, sparse: true },
    description: { type: String, required: true, index: 'text' },
    coverImage: { type: String, required: true },
    images: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    category: { type: String, required: true, index: true },
    tags: { type: [String], default: [], index: true },
    language: { type: String, default: 'English' },
    pages: Number,
    publisher: String,
    publishedAt: Date,
    stock: { type: Number, required: true, default: 0, min: 0 },
    sold: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    isApproved: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    embedding: { type: [Number], select: false },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ category: 1, isApproved: 1, isActive: 1 });
bookSchema.index({ rating: -1, reviewCount: -1 });
bookSchema.index({ price: 1 });

export const Book = mongoose.model<IBook>('Book', bookSchema);
