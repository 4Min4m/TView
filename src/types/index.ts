export interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface MediaItem {
  id: number;
  title?: string; // for movies
  name?: string; // for TV shows
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string; // for movies
  first_air_date?: string; // for TV shows
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  media_type: 'tv' | 'movie';
  popularity: number;
}

export interface UserShow {
  id: string;
  user_id: string;
  tmdb_id: number;
  media_type: 'tv' | 'movie';
  status: 'watching' | 'watched' | 'to_watch';
  rating?: number;
  favorite: boolean;
  current_episode: number;
  current_season: number;
  created_at: string;
  updated_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  type: string;
  tmdb_id?: number;
  media_type?: 'tv' | 'movie';
  metadata: Record<string, any>;
  created_at: string;
  profiles?: User;
}

export interface Genre {
  id: number;
  name: string;
}

export interface SearchResult {
  page: number;
  results: MediaItem[];
  total_pages: number;
  total_results: number;
}