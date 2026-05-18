export enum UserRole {
  Customer = 'customer',
  Seller = 'seller',
  Admin = 'admin',
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Book {
  _id: string;
  title: string;
  slug: string;
  author: string;
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
  stock: number;
  sold: number;
  rating: number;
  reviewCount: number;
  seller: { _id: string; name: string; avatar?: string };
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
}

export interface Address {
  _id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  _id: string;
  user: string;
  items: {
    book: string;
    title: string;
    coverImage: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: string;
  shippingAddress: Omit<Address, '_id' | 'label' | 'isDefault'>;
  paymentStatus: string;
  trackingNumber?: string;
  statusHistory: { status: string; timestamp: string; note?: string }[];
  createdAt: string;
}

export interface Review {
  _id: string;
  user: { _id: string; name: string; avatar?: string };
  book: string;
  rating: number;
  title: string;
  body: string;
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
}
