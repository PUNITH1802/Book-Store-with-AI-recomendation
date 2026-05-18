import { Book, IBook } from '../models/Book';
import { Order } from '../models/Order';
import { logger } from '../utils/logger';
import { env } from '../config/env';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RecommendationContext {
  userId: string;
  limit?: number;
}

export class AIService {
  private provider: 'openai' | 'mock';

  constructor() {
    this.provider = env.AI_PROVIDER;
  }

  async getRecommendations(ctx: RecommendationContext): Promise<IBook[]> {
    const purchasedBookIds = await this.getUserPurchasedBookIds(ctx.userId);
    const limit = ctx.limit ?? 10;

    if (purchasedBookIds.length === 0) {
      return this.getPopularBooks(limit);
    }

    const purchasedBooks = await Book.find({ _id: { $in: purchasedBookIds } })
      .select('category tags author')
      .lean();

    const categories = [...new Set(purchasedBooks.map((b) => b.category))];
    const tags = [...new Set(purchasedBooks.flatMap((b) => b.tags))];
    const authors = [...new Set(purchasedBooks.map((b) => b.author))];

    return Book.find({
      _id: { $nin: purchasedBookIds },
      isApproved: true,
      isActive: true,
      $or: [
        { category: { $in: categories } },
        { tags: { $in: tags } },
        { author: { $in: authors } },
      ],
    })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(limit)
      .lean() as Promise<IBook[]>;
  }

  async chat(messages: ChatMessage[], userId: string): Promise<string> {
    if (this.provider === 'openai') {
      return this.openAIChat(messages, userId);
    }
    return this.mockChat(messages);
  }

  async semanticSearch(query: string): Promise<IBook[]> {
    // In production: generate embedding for query, cosine-similarity search
    // Currently: falls back to text search
    logger.debug('Semantic search query', { query });

    return Book.find(
      { $text: { $search: query }, isApproved: true, isActive: true },
      { score: { $meta: 'textScore' } },
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .lean() as Promise<IBook[]>;
  }

  async getTrending(): Promise<IBook[]> {
    return Book.find({ isApproved: true, isActive: true })
      .sort({ sold: -1, rating: -1 })
      .limit(10)
      .lean() as Promise<IBook[]>;
  }

  private async getUserPurchasedBookIds(userId: string): Promise<string[]> {
    const orders = await Order.find({ user: userId, paymentStatus: 'paid' })
      .select('items.book')
      .lean();

    return orders.flatMap((o) => o.items.map((i) => i.book.toString()));
  }

  private async getPopularBooks(limit: number): Promise<IBook[]> {
    return Book.find({ isApproved: true, isActive: true })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(limit)
      .lean() as Promise<IBook[]>;
  }

  private async openAIChat(messages: ChatMessage[], _userId: string): Promise<string> {
    try {
      const { default: OpenAI } = await import('openai');
      const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

      const systemPrompt = `You are BookBot, a knowledgeable assistant for BookCart — an online bookstore. 
Help users discover books, get recommendations, and answer questions about books, authors, and genres.
Be concise, helpful, and enthusiastic about reading. Do not discuss topics unrelated to books.`;

      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content ?? 'I could not generate a response.';
    } catch (err) {
      logger.error('OpenAI chat failed', { error: (err as Error).message });
      return this.mockChat(messages);
    }
  }

  private mockChat(messages: ChatMessage[]): string {
    const last = messages[messages.length - 1]?.content?.toLowerCase() ?? '';

    const responses: [RegExp, string][] = [
      [/recommend|suggest/i, "Based on what's trending, I'd recommend 'The Midnight Library' by Matt Haig, 'Atomic Habits' by James Clear, and 'Project Hail Mary' by Andy Weir. Would you like more details on any of these?"],
      [/sci.?fi|science fiction/i, "Great taste! For sci-fi, check out 'Project Hail Mary', 'The Three-Body Problem', or 'Recursion' by Blake Crouch. All are gripping reads."],
      [/mystery|thriller/i, "Mystery fans love 'The Thursday Murder Club' by Richard Osman and 'In the Woods' by Tana French. Both are highly rated!"],
      [/fiction|novel/i, "Some top literary fiction picks: 'The Covenant of Water', 'Tomorrow, and Tomorrow, and Tomorrow', and 'Lessons in Chemistry'. All beautifully written."],
      [/non.?fiction|self.?help/i, "'Atomic Habits' by James Clear and 'Thinking, Fast and Slow' by Daniel Kahneman are must-reads for non-fiction lovers."],
    ];

    for (const [pattern, response] of responses) {
      if (pattern.test(last)) return response;
    }

    return "I'm BookBot, here to help you find your next great read! Ask me for recommendations by genre, similar books, or what's trending.";
  }
}
