import { useState, useEffect } from 'react';
import { UserShowsService } from '../services/userShows';
import type { UserShow } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useUserShows = (userId?: string, status?: string) => {
  const { user } = useAuth();
  const [shows, setShows] = useState<UserShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    const fetchShows = async () => {
      if (!targetUserId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userShows = await UserShowsService.getUserShows(targetUserId, status);
        setShows(userShows);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch shows');
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, [targetUserId, status]);

  const addToList = async (tmdbId: number, mediaType: 'tv' | 'movie', status: 'watching' | 'watched' | 'to_watch' = 'to_watch') => {
    try {
      const newShow = await UserShowsService.addToList(tmdbId, mediaType, status);
      setShows(prev => {
        const existing = prev.find(show => show.tmdb_id === tmdbId && show.media_type === mediaType);
        if (existing) {
          return prev.map(show => 
            show.tmdb_id === tmdbId && show.media_type === mediaType ? newShow : show
          );
        }
        return [...prev, newShow];
      });
      return newShow;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to list');
      throw err;
    }
  };

  const updateStatus = async (tmdbId: number, mediaType: 'tv' | 'movie', status: 'watching' | 'watched' | 'to_watch') => {
    try {
      const updatedShow = await UserShowsService.updateStatus(tmdbId, mediaType, status);
      setShows(prev => prev.map(show => 
        show.tmdb_id === tmdbId && show.media_type === mediaType ? updatedShow : show
      ));
      return updatedShow;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
      throw err;
    }
  };

  const toggleFavorite = async (tmdbId: number, mediaType: 'tv' | 'movie') => {
    try {
      const updatedShow = await UserShowsService.toggleFavorite(tmdbId, mediaType);
      setShows(prev => {
        const existing = prev.find(show => show.tmdb_id === tmdbId && show.media_type === mediaType);
        if (existing) {
          return prev.map(show => 
            show.tmdb_id === tmdbId && show.media_type === mediaType ? updatedShow : show
          );
        }
        return [...prev, updatedShow];
      });
      return updatedShow;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
      throw err;
    }
  };

  const removeFromList = async (tmdbId: number, mediaType: 'tv' | 'movie') => {
    try {
      await UserShowsService.removeFromList(tmdbId, mediaType);
      setShows(prev => prev.filter(show => !(show.tmdb_id === tmdbId && show.media_type === mediaType)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove from list');
      throw err;
    }
  };

  return {
    shows,
    loading,
    error,
    addToList,
    updateStatus,
    toggleFavorite,
    removeFromList,
  };
};