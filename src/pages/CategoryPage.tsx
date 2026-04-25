import { useEffect, useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, TrendingUp, Star, Calendar, Flame, Sparkles, Loader2, ChevronDown, PlayCircle } from 'lucide-react';
import { getCategoryItems, getPersonalizedRecommendations, getRecommendationsByGenreNames } from '../lib/api';
import type { CategoryId } from '../lib/api';
import { useLibraryStore } from '../store/useLibraryStore';
import { QuickSaveMenu } from '../components/QuickSaveMenu';
import { cascadeContainer, cinematicItem } from '../lib/animations';
import { cn } from '../lib/utils';

const CATEGORY_META: Partial<Record<CategoryId, { title: string; subtitle: string; icon: any; color: string; gradient: string }>> = {
  trending: {
    title: 'Em Alta',
    subtitle: 'O que o mundo está assistindo agora',
    icon: TrendingUp,
    color: 'text-amber-400',
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
  },
  popular: {
    title: 'Populares',
    subtitle: 'Os mais assistidos de todos os tempos',
    icon: Flame,
    color: 'text-rose-400',
    gradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
  },
  recommended: {
    title: 'Recomendados',
    subtitle: 'Obras aclamadas pela crítica e pelo público',
    icon: Star,
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
  },
  upcoming: {
    title: 'Mais Aguardados',
    subtitle: 'Lançamentos que você não pode perder',
    icon: Calendar,
    color: 'text-emerald-400',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
  },
  personalized: {
    title: 'Calculado para Você',
    subtitle: 'Baseado no seu gosto único',
    icon: Sparkles,
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 via-blue-500/10 to-transparent',
  },
  watching: {
    title: 'Continuar Assistindo',
    subtitle: 'Itens que você está acompanhando',
    icon: PlayCircle,
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
  },
};

function MediaCard({ item }: { item: any }) {
  return (
    <Link
      to={`/item/${item.type}-${item.id}`}
      state={{ media: item }}
      className="group relative block aspect-[2/3] rounded-xl overflow-hidden border border-white/[0.06] hover:border-white/[0.22] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
    >
      {item.posterPath ? (
        <img
          src={item.posterPath}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-white/[0.03] text-white/20 text-xs text-center p-3 font-bold uppercase tracking-widest">
          {item.title}
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <p className="text-[12px] font-semibold text-white line-clamp-2 leading-snug">{item.title}</p>
        <div className="flex items-center gap-1.5 mt-1">
          {item.voteAverage > 0 && (
            <>
              <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-bold text-white/80">{item.voteAverage.toFixed(1)}</span>
              {item.genres?.length > 0 && <span className="text-white/20 text-[9px]">·</span>}
            </>
          )}
          {item.genres?.length > 0 && (
            <span className="text-[9px] text-white/40 truncate">{item.genres.slice(0, 2).join(' · ')}</span>
          )}
        </div>
      </div>

      {/* Quick Save */}
      <div
        className="absolute top-2 right-2 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-30"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >
        <QuickSaveMenu item={item} />
      </div>
    </Link>
  );
}

export default function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const library = useLibraryStore((s) => s.library);

  const isGenre = categoryId?.startsWith('genre-');
  const genreName = isGenre ? categoryId!.replace('genre-', '') : null;

  const meta = isGenre 
    ? {
        title: `Recomendações: ${genreName}`,
        subtitle: 'Baseado na sua biblioteca',
        icon: Star,
        color: 'text-purple-400',
        gradient: 'from-purple-500/20 via-blue-500/10 to-transparent',
      }
    : CATEGORY_META[categoryId as CategoryId];

  const libraryItems = useMemo(() => Object.values(library).map((li) => ({
    id: li.media.id,
    type: li.media.type,
  })), [library]);

  const { data: recommendations, isLoading: isLoadingRecs } = useQuery({
    queryKey: ['personalizedRecs', libraryItems],
    queryFn: () => getPersonalizedRecommendations(libraryItems),
    enabled: !!categoryId && (categoryId === 'personalized' || (isGenre && !!genreName)),
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingItems,
  } = useInfiniteQuery({
    queryKey: ['categoryItems', categoryId, genreName],
    queryFn: async ({ pageParam = 1 }) => {
      if (categoryId === 'watching') {
        const items = Object.values(library)
          .filter(i => i.status === 'watching')
          .map(i => i.media);
        return { items, totalPages: 1 };
      }
      if (categoryId === 'personalized') {
        return { items: recommendations || [], totalPages: 1 };
      }
      if (isGenre && genreName) {
        return getRecommendationsByGenreNames([genreName], 'movie', pageParam);
      }
      return getCategoryItems(categoryId as CategoryId, pageParam);
    },
    getNextPageParam: (lastPage: any, allPages) => {
      const nextPage = allPages.length + 1;
      return nextPage <= lastPage.totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
    enabled: !!categoryId,
  });

  const items = useMemo(() => data?.pages.flatMap(page => (page as any).items) || [], [data]);
  const totalPages = (data?.pages[0] as any)?.totalPages || 1;
  const page = data?.pages.length || 1;

  if (!meta) {
    navigate('/discover');
    return null;
  }

  const Icon = meta.icon;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative shrink-0 mb-8"
      >
        {/* Gradient glow behind header */}
        <div className={cn('absolute -top-4 -left-8 w-96 h-40 bg-gradient-to-r opacity-50 blur-3xl pointer-events-none', meta.gradient)} />

        <div className="relative flex items-center gap-4">
          <button
            onClick={() => navigate('/discover')}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/50 hover:text-white hover:bg-white/[0.08] transition-all shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br border flex items-center justify-center shrink-0 ${meta.color.replace('text-', 'border-').replace('400', '400/20')} bg-gradient-to-br`}
            style={{ background: `color-mix(in srgb, currentColor 10%, transparent)` }}>
            <Icon className={cn('w-6 h-6', meta.color)} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">{meta.title}</h1>
            <p className="text-[13px] text-white/40 mt-0.5">{meta.subtitle}</p>
          </div>
        </div>
      </motion.div>

      {/* Scrollable content */}
      <div className="flex-1 space-y-12 pb-24">

        {/* Personalized Recommendations */}
        {((recommendations?.length || 0) > 0 || isLoadingRecs) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-purple-400 to-blue-400" />
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h2 className="text-lg font-semibold text-white/90">Recomendado para Você</h2>
              <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest font-semibold">
                Baseado na sua biblioteca
              </span>
            </div>

            {isLoadingRecs ? (
              <div className="flex items-center gap-2 text-white/30 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analisando sua biblioteca...
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                <AnimatePresence>
                  {recommendations?.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03, duration: 0.4 }}
                    >
                      <MediaCard item={item} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.section>
        )}

        {/* Main Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-white/40 to-white/10" />
            <Icon className={cn('w-4 h-4', meta.color)} />
            <h2 className="text-lg font-semibold text-white/90">Todos de {meta.title}</h2>
          </div>

          {isLoadingItems ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
              {Array.from({ length: 21 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-2xl bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <motion.div
                variants={cascadeContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3"
              >
                {items.map((item, i) => (
                  <motion.div key={`${item.id}-${i}`} variants={cinematicItem}>
                    <MediaCard item={item} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Load More */}
              {hasNextPage && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="flex items-center gap-2 px-8 py-3 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] transition-all text-sm font-medium disabled:opacity-50"
                  >
                    {isFetchingNextPage ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</>
                    ) : (
                      <><ChevronDown className="w-4 h-4" /> Carregar mais</>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </motion.section>
      </div>
    </div>
  );
}
