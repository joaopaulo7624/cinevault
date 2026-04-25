import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchMedia } from '../lib/api';
import { Search as SearchIcon, Film, Tv, Loader2, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLibraryStore } from '../store/useLibraryStore';
import { MediaItem } from '../types';
import { PremiumGlassCard } from '../components/PremiumGlassCard';
import { QuickSaveMenu } from '../components/QuickSaveMenu';
import { cascadeContainer, cinematicItem } from '../lib/animations';

const SUGGESTIONS = ['Inception', 'Breaking Bad', 'Interstellar', 'The Bear', 'Dune', 'Succession', 'Oppenheimer'];

export default function Search() {
  const [query, setQuery]     = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef              = useRef<HTMLInputElement>(null);
  const navigate              = useNavigate();
  const library               = useLibraryStore(s => s.library);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 420);
    return () => clearTimeout(t);
  }, [query]);

  const { data: results = [], isLoading: loading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchMedia(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes cache for searches
  });

  const handleSelect = (item: MediaItem) =>
    navigate(`/item/${item.type}-${item.id}`, { state: { media: item } });

  const clearQuery = () => { setQuery(''); inputRef.current?.focus(); };

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto min-h-screen flex flex-col">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="mb-8 shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 flex items-center justify-center">
            <SearchIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-0.5">Buscar</h1>
            <p className="text-[13px] text-white/50 tracking-wide">Encontre filmes e séries para adicionar à coleção.</p>
          </div>
        </div>

        {/* Search input — same style as Library */}
        <div className={`relative transition-all duration-500 rounded-full ${focused ? 'shadow-[0_0_0_1px_rgba(59,130,246,0.15),0_0_20px_rgba(59,130,246,0.05)]' : ''}`}>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            {loading
              ? <Loader2 className="w-4 h-4 text-blue-400/60 animate-spin" />
              : <SearchIcon className={`w-4 h-4 stroke-[1.5] transition-colors duration-300 ${focused ? 'text-blue-400/60' : 'text-white/20'}`} />
            }
          </div>
          <input
            ref={inputRef}
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Filmes, séries, documentários..."
            className="w-full bg-white/[0.02] border border-white/[0.06] rounded-full py-3 pl-11 pr-11 text-[13px] font-medium tracking-[0.03em] text-white/90 placeholder-white/20 focus:outline-none focus:border-blue-500/30 transition-all"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                onClick={clearQuery}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/40 hover:text-white/70 transition-all"
              >
                <X className="w-3 h-3" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ── Scrollable content ───────────────────────────────── */}
      <div className="flex-1 pb-20 md:pb-6 pr-1">

        {/* Initial / no query state */}
        <AnimatePresence>
          {!query.trim() && (
            <motion.div
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Suggestion chips */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-amber-500/50" />
                  <h2 className="text-[11px] font-semibold text-white/30 uppercase tracking-[0.18em]">Sugestões</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={s}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setQuery(s)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-semibold font-mono uppercase tracking-[0.08em] text-white/40 hover:text-white/80 bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.05] transition-all duration-200"
                    >
                      <SearchIcon className="w-3 h-3" />
                      {s}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Quick-access from library */}
              {Object.values(library).length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 rounded-full bg-gradient-to-b from-blue-500 to-blue-700" />
                    <h2 className="text-[13px] font-semibold text-white/70">Recentes na Biblioteca</h2>
                  </div>
                  <motion.div
                    variants={cascadeContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                  >
                    {Object.values(library).slice(0, 6).map((li) => (
                      <motion.div key={li.id} variants={cinematicItem}>
                        <PremiumGlassCard tiltAmount={4} innerParallaxAmount={6} className="aspect-[2/3] p-0 group">
                          <button onClick={() => handleSelect(li.media)} className="absolute inset-0 z-20" />
                          {li.media.posterPath
                            ? <img src={li.media.posterPath} alt={li.media.title} className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700 ease-out" referrerPolicy="no-referrer" />
                            : <div className="w-full h-full flex items-center justify-center text-white/10 text-xs font-bold uppercase tracking-widest p-2 text-center">{li.media.title}</div>
                          }
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-abyss via-abyss/70 to-transparent p-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10">
                            <p className="text-[12px] font-medium text-white/90 line-clamp-2 leading-snug">{li.media.title}</p>
                          </div>
                        </PremiumGlassCard>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        <AnimatePresence>
          {query.trim() && !loading && results.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-white/15 space-y-5"
            >
              <SearchIcon className="w-10 h-10 stroke-[1]" />
              <p className="text-[11px] uppercase tracking-[0.15em] font-medium">
                Nenhum resultado para "{query}"
              </p>
              <button onClick={clearQuery} className="text-[10px] text-blue-500/50 hover:text-blue-400/70 transition-colors uppercase tracking-[0.15em] font-semibold">
                Limpar busca
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results grid — same as Library grid style */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              key="results"
              variants={cascadeContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              {results.map((item) => (
                <motion.div key={`${item.type}-${item.id}`} variants={cinematicItem} className="will-change-transform">
                  <PremiumGlassCard tiltAmount={8} innerParallaxAmount={12} className="aspect-[2/3] p-0 group">
                    <button onClick={() => handleSelect(item)} className="absolute inset-0 z-20" />

                    {item.posterPath ? (
                      <img
                        src={item.posterPath}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-[1.08] transition-transform duration-[1.2s] ease-out opacity-90 group-hover:opacity-100 will-change-transform"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-obsidian text-white/10">
                        {item.type === 'movie' ? <Film className="w-8 h-8 stroke-[1]" /> : <Tv className="w-8 h-8 stroke-[1]" />}
                      </div>
                    )}

                    {/* In-library glow border — same pattern as Library badges */}
                    {library[`${item.type}-${item.id}`] && (
                      <div className="absolute top-3 left-3 z-20 bg-blue-500/20 backdrop-blur-md text-blue-400 px-2 py-0.5 rounded-full border border-blue-400/30 text-[8px] font-semibold uppercase tracking-wider">
                        Salvo
                      </div>
                    )}

                    {/* Quick Save — same position as other pages */}
                    <div
                      className="absolute top-2 right-2 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-30"
                      onClick={e => { e.preventDefault(); e.stopPropagation(); }}
                    >
                      <QuickSaveMenu item={item} />
                    </div>

                    {/* Cinematic hover overlay — same as Library */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-abyss via-abyss/80 to-transparent p-5 opacity-0 group-hover:opacity-100 flex flex-col justify-end transition-all duration-400 translate-y-2 group-hover:translate-y-0 z-10">
                      <h3 className="text-[14px] font-medium text-white/90 line-clamp-1 mb-2">{item.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-semibold text-white/20 uppercase tracking-[0.15em] bg-white/[0.03] px-2 py-0.5 rounded-sm border border-white/[0.03]">
                          {item.type === 'tv' ? 'Série' : 'Filme'}
                        </span>
                        {item.releaseDate && (
                          <span className="text-[11px] text-white/30 font-mono">{item.releaseDate.substring(0, 4)}</span>
                        )}
                      </div>
                    </div>
                  </PremiumGlassCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
