import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  book: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  body: string;
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    body: { type: String, required: true, maxlength: 2000 },
    isVerifiedPurchase: { type: Boolean, default: false },
    helpfulVotes: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true },
);

reviewSchema.index({ book: 1, createdAt: -1 });
reviewSchema.index({ user: 1, book: 1 }, { unique: true });

export const Review = mongoose.model<IReview>('Review', reviewSchema);
