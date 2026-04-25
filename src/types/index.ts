export type MediaType = 'movie' | 'tv';
export type WatchStatus = 'watched' | 'watching' | 'plan_to_watch';

export interface MediaItem {
  id: number;
  type: MediaType;
  title: string;
  posterPath: string | null;
  releaseDate: string;
  genres: string[];
  runtime?: number;
  backdropPath?: string | null;
  overview?: string;
  voteAverage?: number;
  tagline?: string;
}

export interface UserMedia {
  id: string; // string identifier combination of type-id
  media: MediaItem;
  status: WatchStatus;
  rating: number | null; // 1-10
  review: string;
  tags: string[];
  isFavorite: boolean;
  dateAdded: string;
}

export interface User {
  name: string;
  email: string;
  uid: string;
}
