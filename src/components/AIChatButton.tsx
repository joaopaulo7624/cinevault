import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send, Loader2, Film, Tv2, Star, BookmarkPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { searchMedia } from '../lib/api';
import { useLibraryStore } from '../store/useLibraryStore';
import type { UserMedia } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  results?: any[];
}

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

async function askGemini(prompt: string, history: Message[]): Promise<{ text: string; searchQuery?: string }> {
  if (!GEMINI_KEY) {
    // Fallback: extract genre/mood keywords from the prompt
    return { text: '', searchQuery: prompt };
  }

  const systemPrompt = `Você é o CineVault AI, um assistente especialista em cinema e séries.
O usuário vai descrever o que quer assistir em linguagem natural.
Sua tarefa:
1. Responda brevemente (1-2 frases) de forma entusiasmada e personalizada em português.
2. Extraia as palavras-chave mais relevantes para buscar no TMDB (título, gênero, diretor, ator, mood, etc).
3. Retorne um JSON com: { "text": "<sua resposta>", "searchQuery": "<palavras-chave para busca>" }
Responda APENAS com o JSON, sem markdown.`;

  const contents = [
    ...history.slice(-4).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    })),
    { role: 'user', parts: [{ text: prompt }] }
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
      })
    }
  );

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    return { text: raw, searchQuery: prompt };
  }
}

export function AIChatButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! 👋 Diga-me o que você quer assistir — pode ser por mood, gênero, ator, diretor, ou até uma sensação (*"quero algo que me faça chorar"*). Vou encontrar pra você!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const addToLibrary = useLibraryStore(s => s.addToLibrary);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const { text: aiText, searchQuery } = await askGemini(text, messages);
      const query = searchQuery || text;
      const results = await searchMedia(query);
      const top = results.slice(0, 6);

      const assistantMsg: Message = {
        role: 'assistant',
        content: aiText || `Encontrei ${top.length} resultados para "${query}" — aqui estão os melhores! 🎬`,
        results: top
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Ops, tive um problema ao buscar. Tente reformular sua pergunta! 🎬'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50 flex items-center gap-2.5 px-5 py-3 rounded-full shadow-2xl shadow-purple-500/30 border border-purple-500/30 text-white text-[13px] font-semibold"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.9) 0%, rgba(59,130,246,0.9) 100%)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Sparkles className="w-4 h-4" />
        <span className="hidden sm:inline">CineVault AI</span>
      </motion.button>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
              className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full md:w-[480px] max-h-[90vh] md:max-h-[680px] flex flex-col rounded-t-[28px] md:rounded-[28px] border border-white/10 overflow-hidden shadow-2xl shadow-black/60"
              style={{
                background: 'rgba(8, 8, 18, 0.97)',
                backdropFilter: 'blur(40px)',
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06] shrink-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-white">CineVault AI</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest">Assistente Cinematográfico</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="ml-auto p-2 rounded-xl text-white/30 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-blue-600/80 text-white rounded-br-md'
                          : 'bg-white/[0.06] text-white/80 border border-white/[0.06] rounded-bl-md'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Results Grid */}
                    {msg.results && msg.results.length > 0 && (
                      <div className="w-full grid grid-cols-3 gap-2 mt-1">
                        {msg.results.map((item: any) => (
                          <Link
                            key={item.id}
                            to={`/item/${item.type}-${item.id}`}
                            state={{ media: item }}
                            onClick={() => setOpen(false)}
                            className="group relative rounded-xl overflow-hidden border border-white/[0.06] hover:border-white/20 transition-all"
                          >
                            <div className="aspect-[2/3] bg-black/30">
                              {item.posterPath ? (
                                <img
                                  src={item.posterPath}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  {item.type === 'tv' ? (
                                    <Tv2 className="w-6 h-6 text-white/20" />
                                  ) : (
                                    <Film className="w-6 h-6 text-white/20" />
                                  )}
                                </div>
                              )}
                              {/* Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                <p className="text-[9px] font-bold text-white line-clamp-2">{item.title}</p>
                                <div className="flex items-center justify-between mt-1">
                                  {item.voteAverage > 0 && (
                                    <span className="flex items-center gap-0.5 text-[8px] text-amber-400">
                                      <Star className="w-2 h-2 fill-current" />
                                      {item.voteAverage.toFixed(1)}
                                    </span>
                                  )}
                                  <button
                                    onClick={e => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const entry: UserMedia = {
                                        id: `${item.type}-${item.id}`,
                                        media: item,
                                        status: 'plan_to_watch',
                                        rating: null,
                                        review: '',
                                        tags: [],
                                        isFavorite: false,
                                        dateAdded: new Date().toISOString(),
                                      };
                                      addToLibrary(entry);
                                    }}
                                    className="text-white/60 hover:text-white transition-colors"
                                    title="Adicionar à biblioteca"
                                  >
                                    <BookmarkPlus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex items-start gap-2">
                    <div className="bg-white/[0.06] border border-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                      <span className="text-[12px] text-white/40">Analisando e buscando...</span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-4 pb-5 pt-3 border-t border-white/[0.06] shrink-0">
                <div className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 focus-within:border-purple-500/50 transition-colors">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && send()}
                    placeholder="Ex: quero um thriller noir dos anos 90..."
                    className="flex-1 bg-transparent text-[13px] text-white/80 placeholder-white/20 outline-none"
                  />
                  <button
                    onClick={send}
                    disabled={!input.trim() || loading}
                    className="p-1.5 rounded-xl text-white disabled:opacity-30 transition-all hover:scale-110 active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                {!GEMINI_KEY && (
                  <p className="text-[9px] text-white/20 text-center mt-2">
                    Adicione VITE_GEMINI_API_KEY para respostas inteligentes • Busca básica ativa
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
