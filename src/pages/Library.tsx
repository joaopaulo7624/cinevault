import { useState } from 'react';
import { useLibraryStore } from '../store/useLibraryStore';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Filter, PlayCircle, Check, Clock, Heart, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { PremiumGlassCard } from '../components/PremiumGlassCard';
import { cascadeContainer, cinematicItem } from '../lib/animations';
import { QuickSaveMenu } from '../components/QuickSaveMenu';

type FilterType = 'all' | 'watched' | 'watching' | 'plan_to_watch' | 'favorites';

export default function Library() {
  const library = useLibraryStore(state => state.library);
  const [filter, setFilter] = useState<FilterType>('all');
  const [query, setQuery] = useState('');
  const [inputFocused, setInputFocused] = useState(false);

  const items = Object.values(library).filter(item => {
    const matchesQuery = item.media.title.toLowerCase().includes(query.toLowerCase());
    if (!matchesQuery) return false;
    
    if (filter === 'all') return true;
    if (filter === 'favorites') return item.isFavorite;
    return item.status === filter;
  }).sort((a,b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());

  const filters: { id: FilterType; label: string; icon: any }[] = [
    { id: 'all', label: 'Todos', icon: Filter },
    { id: 'watching', label: 'Assistindo', icon: PlayCircle },
    { id: 'watched', label: 'Assistidos', icon: Check },
    { id: 'plan_to_watch', label: 'Quero Ver', icon: Clock },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
  ];

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto min-h-screen flex flex-col">
      <header className="mb-10 shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <Sparkles className="w-4 h-4 text-blue-500/50" />
          <span className="text-[9px] font-semibold text-white/20 uppercase tracking-[0.2em]">Seu Acervo</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-8 text-white/90">Biblioteca</h1>
        
        <div className="flex flex-col md:flex-row gap-5 justify-between items-start md:items-center">
          {/* Filters */}
          <div className="flex overflow-x-auto pb-2 md:pb-0 w-full md:w-auto -mx-4 px-4 md:mx-0 md:px-0 gap-2 hide-scrollbar">
            {filters.map(f => {
               const isActive = filter === f.id;
               return (
                 <button
                   key={f.id}
                   onClick={() => setFilter(f.id)}
                   className={cn(
                     "whitespace-nowrap flex items-center gap-2 px-4 py-2.5 rounded-full text-[10px] uppercase font-semibold tracking-[0.1em] transition-all duration-300 border relative overflow-hidden",
                     isActive 
                      ? "bg-blue-600/10 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
                      : "bg-white/[0.02] text-white/40 border-white/[0.04] hover:border-white/[0.1] hover:text-white/70 hover:bg-white/[0.04]"
                   )}
                 >
                   {isActive && (
                     <div className="absolute inset-0 bg-blue-500/5 blur-[8px] pointer-events-none" />
                   )}
                   <f.icon className={cn(
                     "w-3.5 h-3.5 stroke-[2] relative z-10 transition-colors duration-300", 
                     isActive && f.id === 'favorites' ? 'text-amber-400 fill-amber-400/20' : '',
                     isActive && f.id !== 'favorites' ? 'text-blue-400' : ''
                   )} />
                   <span className="relative z-10">{f.label}</span>
                 </button>
               )
            })}
          </div>

          {/* Search */}
          <div className={`relative w-full md:w-72 shrink-0 transition-all duration-500 rounded-full ${inputFocused ? 'shadow-[0_0_0_1px_rgba(59,130,246,0.15),0_0_20px_rgba(59,130,246,0.05)]' : ''}`}>
             <SearchIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 stroke-[1.5] transition-colors duration-300 ${inputFocused ? 'text-blue-400/60' : 'text-white/20'}`} />
             <input 
               type="text" 
               placeholder="Buscar na biblioteca..."
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               onFocus={() => setInputFocused(true)}
               onBlur={() => setInputFocused(false)}
               className="w-full bg-white/[0.02] border border-white/[0.06] rounded-full py-2.5 pl-11 pr-4 text-[12px] font-medium tracking-[0.05em] text-white/90 placeholder-white/20 focus:outline-none focus:border-blue-500/30 transition-all shadow-inner"
             />
          </div>
        </div>
      </header>

      <div className="flex-1 pb-20 md:pb-0 pr-1">
        <motion.div 
          layout 
          variants={cascadeContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => (
              <motion.div
                layout
                variants={cinematicItem}
                key={item.id}
                className="will-change-transform"
              >
                <PremiumGlassCard tiltAmount={8} innerParallaxAmount={12} className="aspect-[2/3] p-0 group">
                  <Link to={`/item/${item.id}`} className="absolute inset-0 z-20" />
                  
                  {item.media.posterPath ? (
                    <img 
                      src={item.media.posterPath} 
                      alt={item.media.title} 
                      className="w-full h-full object-cover group-hover:scale-[1.08] transition-transform duration-[1.2s] ease-out opacity-90 group-hover:opacity-100 will-change-transform" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-obsidian">
                       <span className="text-white/20 font-bold uppercase tracking-[0.15em] text-[10px]">{item.media.title}</span>
                    </div>
                  )}
                  
                  {/* Glass Badges */}
                  <div className="absolute top-3 left-3 flex gap-2 z-20">
                    {item.isFavorite && (
                      <div className="bg-black/40 backdrop-blur-md text-amber-400 p-1.5 rounded-full border border-white/[0.08] shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                        <Heart className="w-3.5 h-3.5 fill-amber-400/80" />
                      </div>
                    )}
                    {item.status === 'watching' && (
                      <div className="bg-blue-500/20 backdrop-blur-md text-blue-400 p-1.5 rounded-full border border-blue-400/30 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                        <PlayCircle className="w-3.5 h-3.5 stroke-[2] fill-blue-500/10" />
                      </div>
                    )}
                  </div>

                  {/* Quick Save Dropdown */}
                  <div 
                    className="absolute top-2 right-2 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-30"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <QuickSaveMenu item={item.media} />
                  </div>

                  {/* Cinematic Hover Data */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-abyss via-abyss/80 to-transparent p-5 opacity-0 group-hover:opacity-100 flex flex-col justify-end transition-all duration-400 translate-y-2 group-hover:translate-y-0 z-10">
                    <h3 className="text-[14px] font-medium text-white/90 line-clamp-1 mb-2.5">{item.media.title}</h3>
                    <div className="flex items-center justify-between">
                       {item.rating ? (
                         <div className="bg-black/50 backdrop-blur-md px-2 py-1 rounded-[var(--radius-sm)] text-[10px] font-semibold tracking-[0.1em] text-amber-400 border border-white/[0.06]">
                           {item.rating} <span className="text-amber-400/50">/ 10</span>
                         </div>
                       ) : (
                         <div className="text-[9px] font-semibold text-white/20 uppercase tracking-[0.15em]">Sem nota</div>
                       )}
                       <div className="text-[9px] font-mono uppercase tracking-[0.05em] text-white/30">
                         {item.status === 'watched' ? 'Assistido' : item.status === 'plan_to_watch' ? 'Quero Ver' : 'Assistindo'}
                       </div>
                    </div>
                  </div>
                </PremiumGlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {items.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-white/15 space-y-5"
          >
             <Filter className="w-10 h-10 stroke-[1]" />
             <p className="text-[11px] uppercase tracking-[0.15em] font-medium">Nenhuma mídia encontrada</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
