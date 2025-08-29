import { supabase } from '../lib/supabase';
import type { UserShow } from '../types';

export class UserShowsService {
  static async addToList(
    tmdbId: number,
    mediaType: 'tv' | 'movie',
    status: 'watching' | 'watched' | 'to_watch' = 'to_watch'
  ): Promise<UserShow> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_shows')
      .upsert({
        user_id: user.id,
        tmdb_id: tmdbId,
        media_type: mediaType,
        status,
      })
      .select()
      .single();

    if (error) throw error;

    // Create activity
    await this.createActivity('added_to_list', tmdbId, mediaType, { status });

    return data;
  }

  static async updateStatus(
    tmdbId: number,
    mediaType: 'tv' | 'movie',
    status: 'watching' | 'watched' | 'to_watch'
  ): Promise<UserShow> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_shows')
      .update({ status })
      .eq('user_id', user.id)
      .eq('tmdb_id', tmdbId)
      .eq('media_type', mediaType)
      .select()
      .single();

    if (error) throw error;

    // Create activity
    await this.createActivity('status_update', tmdbId, mediaType, { status });

    return data;
  }

  static async toggleFavorite(tmdbId: number, mediaType: 'tv' | 'movie'): Promise<UserShow> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get current favorite status
    const { data: current } = await supabase
      .from('user_shows')
      .select('favorite')
      .eq('user_id', user.id)
      .eq('tmdb_id', tmdbId)
      .eq('media_type', mediaType)
      .single();

    const newFavoriteStatus = !current?.favorite;

    const { data, error } = await supabase
      .from('user_shows')
      .upsert({
        user_id: user.id,
        tmdb_id: tmdbId,
        media_type: mediaType,
        favorite: newFavoriteStatus,
      })
      .select()
      .single();

    if (error) throw error;

    if (newFavoriteStatus) {
      await this.createActivity('favorited', tmdbId, mediaType);
    }

    return data;
  }

  static async rateMedia(tmdbId: number, mediaType: 'tv' | 'movie', rating: number): Promise<UserShow> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_shows')
      .upsert({
        user_id: user.id,
        tmdb_id: tmdbId,
        media_type: mediaType,
        rating,
      })
      .select()
      .single();

    if (error) throw error;

    await this.createActivity('rated', tmdbId, mediaType, { rating });

    return data;
  }

  static async getUserShows(userId: string, status?: string): Promise<UserShow[]> {
    let query = supabase
      .from('user_shows')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getUserShow(tmdbId: number, mediaType: 'tv' | 'movie'): Promise<UserShow | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_shows')
      .select('*')
      .eq('user_id', user.id)
      .eq('tmdb_id', tmdbId)
      .eq('media_type', mediaType)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async removeFromList(tmdbId: number, mediaType: 'tv' | 'movie'): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('user_shows')
      .delete()
      .eq('user_id', user.id)
      .eq('tmdb_id', tmdbId)
      .eq('media_type', mediaType);

    if (error) throw error;

    await this.createActivity('removed_from_list', tmdbId, mediaType);
  }

  private static async createActivity(
    type: string,
    tmdbId?: number,
    mediaType?: 'tv' | 'movie',
    metadata: Record<string, any> = {}
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('activities')
      .insert({
        user_id: user.id,
        type,
        tmdb_id: tmdbId,
        media_type: mediaType,
        metadata,
      });
  }
}