import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../config/env';
import { User } from '../models/User';
import { Book } from '../models/Book';
import { UserRole } from '../constants/roles';

const CATEGORIES = ['Fiction', 'Non-Fiction', 'Science', 'History', 'Technology', 'Self-Help', 'Biography', 'Fantasy'];

const SAMPLE_BOOKS = [
  { title: 'The Midnight Library', author: 'Matt Haig', category: 'Fiction', price: 16.99, rating: 4.5, stock: 100 },
  { title: 'Atomic Habits', author: 'James Clear', category: 'Self-Help', price: 18.99, rating: 4.8, stock: 200 },
  { title: 'Project Hail Mary', author: 'Andy Weir', category: 'Science', price: 17.99, rating: 4.9, stock: 150 },
  { title: 'The Three-Body Problem', author: 'Liu Cixin', category: 'Fiction', price: 15.99, rating: 4.7, stock: 80 },
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'Non-Fiction', price: 19.99, rating: 4.6, stock: 120 },
  { title: 'Dune', author: 'Frank Herbert', category: 'Fantasy', price: 14.99, rating: 4.8, stock: 90 },
  { title: 'Sapiens', author: 'Yuval Noah Harari', category: 'History', price: 17.99, rating: 4.6, stock: 110 },
  { title: 'Clean Code', author: 'Robert C. Martin', category: 'Technology', price: 39.99, rating: 4.5, stock: 60 },
];

async function seed() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Create admin
  const adminExists = await User.findOne({ email: 'admin@bookcart.io' });
  if (!adminExists) {
    await User.create({
      name: 'Admin',
      email: 'admin@bookcart.io',
      password: 'Admin@123',
      role: UserRole.Admin,
      isEmailVerified: true,
    });
    console.log('Admin created: admin@bookcart.io / Admin@123');
  }

  // Create seller
  let seller = await User.findOne({ email: 'seller@bookcart.io' });
  if (!seller) {
    seller = await User.create({
      name: 'BookCart Seller',
      email: 'seller@bookcart.io',
      password: 'Seller@123',
      role: UserRole.Seller,
      isEmailVerified: true,
    });
    console.log('Seller created: seller@bookcart.io / Seller@123');
  }

  // Seed books
  const bookCount = await Book.countDocuments();
  if (bookCount === 0) {
    const books = SAMPLE_BOOKS.map((b, i) => ({
      ...b,
      slug: b.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: `A bestselling ${b.category.toLowerCase()} book by ${b.author}. This is a must-read that has captivated millions of readers worldwide.`,
      coverImage: `https://picsum.photos/seed/book${i}/300/400`,
      seller: seller!._id,
      isApproved: true,
      isFeatured: i < 4,
      tags: [b.category.toLowerCase(), b.author.split(' ')[1]?.toLowerCase() ?? 'book'],
      reviewCount: Math.floor(Math.random() * 500) + 50,
      sold: Math.floor(Math.random() * 1000) + 100,
    }));

    await Book.insertMany(books);
    console.log(`${books.length} books seeded`);
  }

  await mongoose.disconnect();
  console.log('Seed complete');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
