import type { MediaItem, SearchResult, Genre } from '../types';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;
export const TMDB_IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

class TMDbService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = TMDB_API_KEY || 'demo_key';
    this.baseUrl = TMDB_BASE_URL || 'https://api.themoviedb.org/3';
  }

  private async request<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${this.apiKey}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`TMDb API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('TMDb API request failed:', error);
      throw error;
    }
  }

  async searchMulti(query: string, page = 1): Promise<SearchResult> {
    return this.request(`/search/multi?query=${encodeURIComponent(query)}&page=${page}`);
  }

  async getTrending(timeWindow: 'day' | 'week' = 'week'): Promise<SearchResult> {
    return this.request(`/trending/all/${timeWindow}`);
  }

  async getPopularMovies(page = 1): Promise<SearchResult> {
    return this.request(`/movie/popular?page=${page}`);
  }

  async getPopularTVShows(page = 1): Promise<SearchResult> {
    return this.request(`/tv/popular?page=${page}`);
  }

  async getMediaDetails(mediaType: 'tv' | 'movie', id: number): Promise<MediaItem> {
    const data = await this.request(`/${mediaType}/${id}`);
    return { ...data, media_type: mediaType };
  }

  async getGenres(mediaType: 'tv' | 'movie'): Promise<Genre[]> {
    const data = await this.request(`/genre/${mediaType}/list`);
    return data.genres;
  }

  async discoverByGenre(mediaType: 'tv' | 'movie', genreId: number, page = 1): Promise<SearchResult> {
    return this.request(`/discover/${mediaType}?with_genres=${genreId}&page=${page}`);
  }

  getImageUrl(path: string | null, size: 'w200' | 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string {
    if (!path) return '/placeholder-poster.jpg';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
}

export const tmdbService = new TMDbService();