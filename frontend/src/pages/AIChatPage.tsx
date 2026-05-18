import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Sparkles, RotateCcw } from 'lucide-react';
import { aiService } from '@/services/ai.service';
import { useAuthStore } from '@/store/auth.store';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Message { role: 'user' | 'assistant'; content: string; }

const STARTERS = [
  'Recommend a book like Dune but shorter',
  'What are the best sci-fi novels of the last 5 years?',
  'I want a cozy mystery to read this weekend',
  'Books that will teach me about behavioral psychology',
];

export function AIChatPage() {
  const { isAuthenticated } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm BookBot, your personal reading guide. Tell me what you're in the mood for, a book you loved, or what you're curious about — and I'll find your next great read." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text = input) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: 'user', content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const reply = await aiService.chat(newMessages.slice(-10));
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center">
            <Bot className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h1 className="font-bold">BookBot</h1>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Online
            </p>
          </div>
        </div>
        <button onClick={() => setMessages([{ role: 'assistant', content: "Hi! I'm BookBot, your personal reading guide. What would you like to explore?" }])} className="btn-ghost text-xs flex items-center gap-1.5">
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {!isAuthenticated && (
        <div className="card p-4 mb-4 border-brand-600/20 bg-brand-600/5 flex items-center justify-between">
          <p className="text-sm text-gray-400">Sign in to save your conversations and get personalized picks.</p>
          <Link to="/login" className="text-sm text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                msg.role === 'user' ? 'bg-brand-600' : 'bg-surface-card border border-surface-border'
              )}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-brand-400" />}
              </div>
              <div className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-brand-600 text-white rounded-tr-sm'
                  : 'bg-surface-card border border-surface-border rounded-tl-sm'
              )}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-card border border-surface-border flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-brand-400" />
            </div>
            <div className="bg-surface-card border border-surface-border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 0.15, 0.3].map((delay, i) => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay }}
                    className="w-1.5 h-1.5 rounded-full bg-brand-400"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Starters */}
      {messages.length === 1 && (
        <div className="grid grid-cols-2 gap-2 my-4">
          {STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-xs text-left card p-3 hover:border-brand-600/40 hover:bg-surface-muted transition-all text-gray-400 hover:text-white"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3 mt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
          placeholder="Ask about books, genres, recommendations..."
          className="input flex-1"
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="btn-primary px-4 py-2 flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
