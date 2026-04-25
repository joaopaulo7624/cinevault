import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import gsap from 'gsap';
import { Compass, TrendingUp, Star, Calendar, Flame, PlayCircle, Heart, Sparkles } from 'lucide-react';
import { getDiscoverCategories, getPersonalizedRecommendations, getRecommendationsByGenreNames, getMediaDetails } from '../lib/api';
import { Link } from 'react-router-dom';
import { QuickSaveMenu } from '../components/QuickSaveMenu';
import { HeroCarousel } from '../components/HeroCarousel';
import { useAuthStore } from '../store/useAuthStore';
import { useLibraryStore } from '../store/useLibraryStore';
import { DiscoverSkeleton } from '../components/LoadingSkeleton';

const GENRES = ['Para Você', 'Ação', 'Comédia', 'Drama', 'Ficção científica', 'Terror', 'Documentário', 'Animação'];

export default function Discover() {
  const queryClient = useQueryClient();
  const library = useLibraryStore(state => state.library);
  const user = useAuthStore(state => state.user);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedGenre, setSelectedGenre] = useState('Para Você');

  const prefetchDetails = (id: number, type: 'movie' | 'tv') => {
    queryClient.prefetchQuery({
      queryKey: ['mediaDetails', type, id],
      queryFn: () => getMediaDetails(id, type),
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
  };
  
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const interests = useMemo(() => {
    const items = Object.values(library);
    if (items.length === 0) return { genres: [], watching: [] };

    const genreCounts: Record<string, number> = {};
    const watching: any[] = [];

    items.forEach(item => {
      if (item.status === 'watching') watching.push(item.media);
      item.media.genres.forEach(g => {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    });

    const topGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([name]) => name);

    return { topGenres, watching };
  }, [library]);

  const { data: baseData, isLoading: isBaseLoading } = useQuery({
    queryKey: ['discoverCategories'],
    queryFn: getDiscoverCategories,
  });

  const libraryList = useMemo(() => Object.values(library).map(l => ({ id: l.media.id, type: l.media.type })), [library]);

  const { data: personalizedRecs, isLoading: isPersonalizedLoading } = useQuery({
    queryKey: ['personalizedRecs', libraryList],
    queryFn: () => getPersonalizedRecommendations(libraryList),
    enabled: libraryList.length > 0,
  });

  // Genre Filtering Query
  const { data: filteredResults, isLoading: isFiltering } = useQuery({
    queryKey: ['genreFilter', selectedGenre],
    queryFn: () => getRecommendationsByGenreNames([selectedGenre], 'movie'),
    enabled: selectedGenre !== 'Para Você',
  });

  const { data: genreBasedData, isLoading: isGenreLoading } = useQuery({
    queryKey: ['genreBasedRecs', interests.topGenres],
    queryFn: async () => {
      const results = await Promise.all(
        interests.topGenres.map(async (genre) => {
          const data = await getRecommendationsByGenreNames([genre], 'movie');
          return {
            title: `Porque você gosta de ${genre}`,
            genreName: genre,
            data: (data as any).items.filter((d: any) => !libraryList.some(l => l.id === d.id)).slice(0, 20)
          };
        })
      );
      return results.filter(g => g.data.length > 0);
    },
    enabled: interests.topGenres.length > 0,
  });

  const loading = isBaseLoading || (libraryList.length > 0 && (isPersonalizedLoading || isGenreLoading));

  const categories = useMemo(() => ({
    trending: baseData?.trending || [],
    popular: baseData?.popular || [],
    recommended: baseData?.recommended || [],
    upcoming: baseData?.upcoming || [],
    personalized: personalizedRecs || [],
    watching: interests.watching,
    genreBased: genreBasedData || []
  }), [baseData, personalizedRecs, interests.watching, genreBasedData]);

  useEffect(() => {
    if (loading || isFiltering) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.reveal-header', 
        { opacity: 0, y: 20, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      );
      gsap.fromTo('.reveal-section', 
        { opacity: 0, y: 30, filter: 'blur(10px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
      );
      gsap.fromTo('.reveal-item',
        { opacity: 0, scale: 0.95, filter: 'blur(5px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.6, stagger: 0.05, ease: 'back.out(1.2)', delay: 0.4 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [loading, isFiltering, categories, selectedGenre]);

  const sections = useMemo(() => {
    if (selectedGenre !== 'Para Você' && filteredResults) {
      return [
        { id: 'filtered', title: `Explorando: ${selectedGenre}`, icon: Sparkles, data: (filteredResults as any).items, color: 'text-blue-400', subtitle: 'Resultados filtrados para você' }
      ];
    }

    const base = [
      { id: 'watching', title: 'Continuar Assistindo', icon: PlayCircle, data: categories.watching, color: 'text-blue-400', subtitle: 'Continue de onde parou', hideIfEmpty: true },
      { id: 'personalized', title: 'Calculado para Você', icon: Heart, data: categories.personalized, color: 'text-pink-500', subtitle: 'Baseado no seu gosto único', hideIfEmpty: true },
      ...categories.genreBased.map((g: any) => ({
        id: `genre-${g.genreName}`,
        title: g.title,
        icon: Star,
        data: g.data,
        color: 'text-purple-400',
        subtitle: 'Recomendação baseada na sua biblioteca',
        hideIfEmpty: true
      })),
      { id: 'trending', title: 'Em Alta no Momento', icon: TrendingUp, data: categories.trending, color: 'text-amber-500', subtitle: 'O que o mundo está vendo hoje' },
      { id: 'popular', title: 'Populares', icon: Flame, data: categories.popular, color: 'text-rose-500', subtitle: 'Títulos mais acessados' },
      { id: 'recommended', title: 'Sugestões CineVault', icon: Star, data: categories.recommended, color: 'text-blue-500', subtitle: 'Aclamação da crítica e público' },
      { id: 'upcoming', title: 'Pronto para os próximos?', icon: Calendar, data: categories.upcoming, color: 'text-emerald-500', subtitle: 'Lançamentos vindo por aí' },
    ];
    return base.filter(s => !(s as any).hideIfEmpty || (s.data && s.data.length > 0));
  }, [categories, selectedGenre, filteredResults]);

  if (loading && categories.trending.length === 0) {
    return (
      <div className="p-8 w-full max-w-7xl mx-auto">
        <DiscoverSkeleton />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col relative z-10 w-full min-h-screen">
      <header className="mb-10 shrink-0 reveal-header">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-600/20 border border-white/10 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <Compass className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-0.5">
                {greeting}, {user?.name.split(' ')[0] || 'Visitante'}
              </h1>
              <p className="text-[12px] text-white/40 tracking-wide font-medium">Sua central de inteligência cinematográfica.</p>
            </div>
          </div>
        </div>

        {/* Cinematic Hero */}
        {selectedGenre === 'Para Você' && categories.trending.length > 0 && (
          <div className="mb-12">
            <HeroCarousel items={categories.trending.slice(0, 5)} />
          </div>
        )}

        {/* Genre Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          {GENRES.map((genre) => (
            <button 
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all duration-300 shrink-0 border
                ${selectedGenre === genre 
                  ? 'bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/20' 
                  : 'bg-white/[0.03] text-white/50 border-white/[0.05] hover:bg-white/[0.08] hover:text-white/80'}`}
            >
              {genre}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 pb-24 space-y-12">
        {sections.map((sec) => (
           <section key={sec.id} className="reveal-section">
             <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <sec.icon className={`w-4 h-4 ${sec.color} drop-shadow-md`} />
                    <h2 className="text-lg font-bold tracking-tight text-white/90">{sec.title}</h2>
                  </div>
                  {sec.subtitle && <p className="text-[11px] text-white/30 font-medium ml-6">{sec.subtitle}</p>}
                </div>
                <Link
                  to={`/discover/${sec.id}`}
                  className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold text-white/30 hover:text-white/70 transition-colors border border-white/[0.05] px-3 py-1.5 rounded-full bg-white/[0.02] magnetic"
                >
                  Explorar
                  <span className="text-white/20">→</span>
                </Link>
             </div>
             
             {/* Horizontal Carousel */}
             <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory pt-2 pr-4 no-scrollbar">
                <div className="flex gap-4">
                  {sec.data.map((item) => (
                    <div key={item.id} className="snap-start shrink-0 reveal-item">
                      <Link
                        to={`/item/${item.type}-${item.id}`}
                        state={{ media: item }}
                        className="group relative block w-[140px] md:w-[170px] aspect-[2/3] rounded-xl overflow-hidden border border-white/[0.06] hover:border-white/[0.22] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
                        onMouseEnter={() => prefetchDetails(item.id, item.type)}
                      >
                        {item.posterPath ? (
                          <img
                            src={item.posterPath}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white/[0.03] text-white/20 text-xs text-center p-2 uppercase tracking-widest font-bold">
                            {item.title}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                          <p className="text-[11px] font-bold text-white line-clamp-2 leading-tight mb-1.5">{item.title}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] uppercase tracking-widest text-white/40 font-bold">{item.type === 'tv' ? 'Série' : 'Filme'}</span>
                            {item.voteAverage > 0 && (
                              <>
                                <span className="text-white/20 text-[8px]">·</span>
                                <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                <span className="text-[9px] font-bold text-white/80">{item.voteAverage.toFixed(1)}</span>
                              </>
                            )}
                          </div>
                          {item.basedOn && <p className="text-[8px] text-blue-400/80 truncate mt-1">↳ {item.basedOn.title}</p>}
                        </div>
                        <div
                          className="absolute top-2 right-2 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-30"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        >
                          <QuickSaveMenu item={item} />
                        </div>
                        {item.userStatus === 'watching' && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-lg shadow-blue-500/30 border border-blue-400/50 z-20">
                            Ao vivo
                          </div>
                        )}
                      </Link>
                    </div>
                  ))}
                </div>
             </div>
           </section>
        ))}
      </div>
    </div>
  );
}
