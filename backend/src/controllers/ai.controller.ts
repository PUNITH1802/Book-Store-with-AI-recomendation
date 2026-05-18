import { Request, Response } from 'express';
import { z } from 'zod';
import { AIService } from '../services/ai.service';
import { ApiResponse } from '../utils/ApiResponse';

const aiService = new AIService();

export class AIController {
  recommendations = async (req: Request, res: Response): Promise<void> => {
    const limit = Math.min(20, parseInt(req.query.limit as string) || 10);
    const books = await aiService.getRecommendations({ userId: req.user!.sub, limit });
    ApiResponse.success(res, books);
  };

  chat = async (req: Request, res: Response): Promise<void> => {
    const { messages } = z
      .object({
        messages: z
          .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(1000) }))
          .min(1)
          .max(20),
      })
      .parse(req.body);

    const reply = await aiService.chat(messages, req.user!.sub);
    ApiResponse.success(res, { reply });
  };

  semanticSearch = async (req: Request, res: Response): Promise<void> => {
    const { q } = z.object({ q: z.string().min(1).max(200) }).parse(req.query);
    const books = await aiService.semanticSearch(q);
    ApiResponse.success(res, books);
  };

  trending = async (_req: Request, res: Response): Promise<void> => {
    const books = await aiService.getTrending();
    ApiResponse.success(res, books);
  };
}
