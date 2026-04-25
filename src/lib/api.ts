export const mockMovies = [
  {
    id: 155,
    title: "O Cavaleiro das Trevas",
    posterPath: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    releaseDate: "2008-07-16",
    type: "movie",
    genres: ["Ação", "Crime", "Drama", "Thriller"],
    runtime: 152
  },
  {
    id: 278,
    title: "Um Sonho de Liberdade",
    posterPath: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    releaseDate: "1994-09-23",
    type: "movie",
    genres: ["Drama", "Crime"],
    runtime: 142
  },
  {
    id: 1399,
    title: "Game of Thrones",
    posterPath: "https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    releaseDate: "2011-04-17",
    type: "tv",
    genres: ["Sci-Fi & Fantasy", "Drama", "Action & Adventure"],
    runtime: 60
  },
  {
    id: 66732,
    title: "Stranger Things",
    posterPath: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    releaseDate: "2016-07-15",
    type: "tv",
    genres: ["Drama", "Sci-Fi & Fantasy", "Mystery"],
    runtime: 50
  },
  {
    id: 27205,
    title: "A Origem",
    posterPath: "https://image.tmdb.org/t/p/w500/oF4oYmQz3W4y6C1e4j84B0W9H7a.jpg",
    releaseDate: "2010-07-15",
    type: "movie",
    genres: ["Ação", "Ficção científica", "Aventura"],
    runtime: 148
  }
];

let genreMap: Record<number, string> = {};

async function initializeGenres(apiKey: string) {
  if (Object.keys(genreMap).length > 0) return;
  try {
    const [moviesRes, tvRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=pt-BR`),
      fetch(`https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}&language=pt-BR`)
    ]);
    const moviesData = await moviesRes.json();
    const tvData = await tvRes.json();
    
    [...(moviesData.genres || []), ...(tvData.genres || [])].forEach((g: any) => {
      genreMap[g.id] = g.name;
    });
  } catch (e) {
    console.error("Failed to fetch TMDB genres", e);
  }
}

const getApiKey = () => {
  const key = import.meta.env.VITE_TMDB_API_KEY;
  if (!key) throw new Error("TMDB API Key missing");
  return key;
};

export async function searchMedia(query: string) {
  const apiKey = getApiKey();
  
  try {
    await initializeGenres(apiKey);
    const res = await fetch(`https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&api_key=${apiKey}&language=pt-BR`);
    if (!res.ok) throw new Error("Search failed");
    const data = await res.json();
    
    return data.results
      .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
      .map((item: any) => ({
        id: item.id,
        type: item.media_type,
        title: item.title || item.name,
        posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
        voteAverage: item.vote_average || 0,
        overview: item.overview || '',
        releaseDate: item.release_date || item.first_air_date || '',
        genres: (item.genre_ids || []).map((id: number) => genreMap[id]).filter(Boolean),
        runtime: 120,
      }));
  } catch (error) {
    console.error("TMDB error:", error);
    return [];
  }
}

export async function getMediaDetails(id: number, type: 'movie' | 'tv') {
  const apiKey = getApiKey();
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey}&language=pt-BR&append_to_response=credits`
    );
    const data = await res.json();

    const crew       = data.credits?.crew   || [];
    const cast       = data.credits?.cast   || [];
    const director   = crew.find((p: any) => p.job === 'Director')?.name || '';
    const writer     = crew.find((p: any) => ['Writer', 'Screenplay', 'Story'].includes(p.job))?.name || '';
    const production = data.production_companies?.map((c: any) => c.name).join(', ') || '';

    return {
      id: data.id,
      type: type,
      title: data.title || data.name,
      posterPath: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
      backdropPath: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
      voteAverage: data.vote_average || 0,
      popularity: data.popularity || 0,
      tagline: data.tagline || '',
      releaseDate: data.release_date || data.first_air_date || '',
      genres: data.genres?.map((g: any) => g.name) || [],
      runtime: data.runtime || (data.episode_run_time ? data.episode_run_time[0] : 45),
      overview: data.overview || '',
      director,
      writer,
      production,
      cast: cast.slice(0, 5).map((p: any) => ({
        id: p.id,
        name: p.name,
        character: p.character,
        profilePath: p.profile_path ? `https://image.tmdb.org/t/p/w185${p.profile_path}` : null,
      })),
    };
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function getDiscoverCategories() {
  const apiKey = getApiKey();

  await initializeGenres(apiKey);

  const fetchCategory = async (endpoint: string) => {
    try {
      const res = await fetch(`https://api.themoviedb.org/3${endpoint}?api_key=${apiKey}&language=pt-BR`);
      const data = await res.json();
      return (data.results || [])
        .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv' || !item.media_type) // movie by default if no media_type
        .map((item: any) => ({
          id: item.id,
          type: item.media_type || (item.name ? 'tv' : 'movie'),
          title: item.title || item.name,
          posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
          backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
          voteAverage: item.vote_average || 0,
          overview: item.overview || '',
          releaseDate: item.release_date || item.first_air_date || '',
          genres: (item.genre_ids || []).map((id: number) => genreMap[id]).filter(Boolean), 
          runtime: 120, 
        }));
    } catch (e) {
      console.error("TMDB fetch category error:", e);
      return [];
    }
  };

  const [trending, recommended, upcoming, popular] = await Promise.all([
    fetchCategory('/trending/all/day'),
    fetchCategory('/movie/top_rated'),
    fetchCategory('/movie/upcoming'),
    fetchCategory('/movie/popular')
  ]);

  return { trending, recommended, upcoming, popular };
}

export type CategoryId = 'trending' | 'popular' | 'recommended' | 'upcoming' | 'personalized' | 'watching';

const CATEGORY_ENDPOINTS: Partial<Record<CategoryId, string>> = {
  trending: '/trending/all/day',
  popular: '/movie/popular',
  recommended: '/movie/top_rated',
  upcoming: '/movie/upcoming',
};

export async function getCategoryItems(categoryId: CategoryId, page = 1) {
  const apiKey = getApiKey();

  await initializeGenres(apiKey);
  const endpoint = CATEGORY_ENDPOINTS[categoryId];
  if (!endpoint) return { items: [], totalPages: 1 };

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3${endpoint}?api_key=${apiKey}&language=pt-BR&page=${page}`
    );
    const data = await res.json();
    const items = (data.results || [])
      .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv' || !item.media_type)
      .map((item: any) => ({
        id: item.id,
        type: item.media_type || (item.name ? 'tv' : 'movie'),
        title: item.title || item.name,
        posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
        voteAverage: item.vote_average || 0,
        overview: item.overview || '',
        releaseDate: item.release_date || item.first_air_date || '',
        genres: (item.genre_ids || []).map((id: number) => genreMap[id]).filter(Boolean),
        runtime: 120,
      }));
    return { items, totalPages: Math.min(data.total_pages || 1, 10) };
  } catch (e) {
    console.error(e);
    return { items: [], totalPages: 1 };
  }
}

// Given a list of media items from the user's library, fetch TMDB similar/recommendations
export async function getPersonalizedRecommendations(libraryItems: Array<{ id: number; type: string }>) {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  if (!apiKey || libraryItems.length === 0) return [];

  await initializeGenres(apiKey);

  // Use up to 15 library items as sources (was 5)
  const sources = libraryItems.slice(0, 15);
  const seenIds = new Set(libraryItems.map((i) => i.id));

  // For each source, fetch both 'recommendations' AND 'similar' to maximize results
  const allRecs = await Promise.all(
    sources.map(async (src) => {
      try {
        const [recsRes, similarRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/${src.type}/${src.id}/recommendations?api_key=${apiKey}&language=pt-BR`),
          fetch(`https://api.themoviedb.org/3/${src.type}/${src.id}/similar?api_key=${apiKey}&language=pt-BR`),
        ]);
        const [recsData, similarData] = await Promise.all([recsRes.json(), similarRes.json()]);

        const mapItem = (item: any) => ({
          id: item.id,
          type: item.media_type || src.type,
          title: item.title || item.name,
          posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
          backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
          voteAverage: item.vote_average || 0,
          overview: item.overview || '',
          releaseDate: item.release_date || item.first_air_date || '',
          genres: (item.genre_ids || []).map((id: number) => genreMap[id]).filter(Boolean),
          runtime: 120,
          basedOn: src,
        });

        return [
          ...(recsData.results || []).map(mapItem),
          ...(similarData.results || []).map(mapItem),
        ];
      } catch {
        return [];
      }
    })
  );

  // Flatten, deduplicate, filter out library items and those without posters, sort by rating
  const seen = new Set<number>();
  return allRecs
    .flat()
    .filter((item) => {
      if (!item.posterPath) return false;
      if (seenIds.has(item.id) || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .sort((a, b) => b.voteAverage - a.voteAverage)
    .slice(0, 60);
}

export async function getRecommendationsByGenre(genreIds: number[], type: 'movie' | 'tv' = 'movie', page = 1) {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  if (!apiKey || genreIds.length === 0) return { items: [], totalPages: 1 };

  await initializeGenres(apiKey);

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/discover/${type}?api_key=${apiKey}&language=pt-BR&with_genres=${genreIds.join(',')}&sort_by=popularity.desc&page=${page}`
    );
    const data = await res.json();
    const items = (data.results || []).map((item: any) => ({
      id: item.id,
      type: type,
      title: item.title || item.name,
      posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
      backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
      voteAverage: item.vote_average || 0,
      overview: item.overview || '',
      releaseDate: item.release_date || item.first_air_date || '',
      genres: (item.genre_ids || []).map((id: number) => genreMap[id]).filter(Boolean),
      runtime: 120,
    }));
    return { items, totalPages: Math.min(data.total_pages || 1, 10) };
  } catch {
    return { items: [], totalPages: 1 };
  }
}

export async function getRecommendationsByGenreNames(genreNames: string[], type: 'movie' | 'tv' = 'movie', page = 1) {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  if (!apiKey || genreNames.length === 0) return [];

  await initializeGenres(apiKey);

  const genreIds = genreNames.map(name => {
    const entry = Object.entries(genreMap).find(([_, n]) => n === name);
    return entry ? entry[0] : null;
  }).filter((id): id is string => id !== null);

  if (genreIds.length === 0) return { items: [], totalPages: 1 };

  return getRecommendationsByGenre(genreIds.map(id => Number(id)), type, page);
}

export const api = {
  searchMedia,
  getMediaDetails,
  getDiscoverCategories,
  getCategoryItems,
  getPersonalizedRecommendations,
  getRecommendationsByGenre,
  getRecommendationsByGenreNames,
  getTrendingMedia
};

export async function getTrendingMedia(type: 'all' | 'movie' | 'tv' = 'all') {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  if (!apiKey) return mockMovies;

  await initializeGenres(apiKey);

  try {
    const res = await fetch(`https://api.themoviedb.org/3/trending/${type}/week?api_key=${apiKey}&language=pt-BR`);
    const data = await res.json();
    return (data.results || []).map((item: any) => ({
      id: item.id,
      type: item.media_type || (item.name ? 'tv' : 'movie'),
      title: item.title || item.name,
      posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
      backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
      voteAverage: item.vote_average || 0,
      overview: item.overview || '',
      releaseDate: item.release_date || item.first_air_date || '',
      genres: (item.genre_ids || []).map((id: number) => genreMap[id]).filter(Boolean),
      runtime: 120,
    }));
  } catch {
    return [];
  }
}
