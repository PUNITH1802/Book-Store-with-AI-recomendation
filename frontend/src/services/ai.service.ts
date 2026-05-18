import { api } from '@/lib/axios';
import type { Book, ApiResponse } from '@/types';

interface ChatMessage { role: 'user' | 'assistant'; content: string; }

export const aiService = {
  recommendations: (limit = 10) =>
    api.get<ApiResponse<Book[]>>('/ai/recommendations', { params: { limit } }).then((r) => r.data.data),

  chat: (messages: ChatMessage[]) =>
    api.post<ApiResponse<{ reply: string }>>('/ai/chat', { messages }).then((r) => r.data.data.reply),

  semanticSearch: (q: string) =>
    api.get<ApiResponse<Book[]>>('/ai/semantic-search', { params: { q } }).then((r) => r.data.data),

  trending: () =>
    api.get<ApiResponse<Book[]>>('/ai/trending').then((r) => r.data.data),
};
