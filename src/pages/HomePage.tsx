import React, { useEffect, useState } from 'react';
import { TrendingUp, Clock, Heart } from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import { useUserShows } from '../hooks/useUserShows';
import { useAuth } from '../contexts/AuthContext';
import { MediaCard } from '../components/ui/MediaCard';
import { ActivityFeed } from '../components/feed/ActivityFeed';
import type { MediaItem } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { shows: userShows } = useUserShows();
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const results = await tmdbService.getTrending();
        // Filter and limit to movies and TV shows
        const filteredResults = results.results
          .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
          .slice(0, 12);
        setTrending(filteredResults);
      } catch (error) {
        console.error('Failed to fetch trending:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  const watchingShows = userShows.filter(show => show.status === 'watching');
  const favoriteShows = userShows.filter(show => show.favorite);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Track Your Entertainment Journey
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover, track, and share your favorite movies and TV shows with friends. 
              Get personalized recommendations and never miss what's trending.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <TrendingUp className="h-8 w-8 text-purple-600 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">Discover</h3>
                <p className="text-gray-600">Find trending shows and movies tailored to your interests</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Clock className="h-8 w-8 text-emerald-600 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">Track</h3>
                <p className="text-gray-600">Keep track of what you're watching and what's next</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Heart className="h-8 w-8 text-red-500 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">Share</h3>
                <p className="text-gray-600">Follow friends and see what they're watching</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="h-6 w-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {trending.map((media) => {
                  const userShow = userShows.find(
                    show => show.tmdb_id === media.id && show.media_type === media.media_type
                  );
                  
                  return (
                    <MediaCard
                      key={`${media.id}-${media.media_type}`}
                      media={media}
                      userShow={userShow}
                    />
                  );
                })}
              </div>
            </section>

            {watchingShows.length > 0 && (
              <section>
                <div className="flex items-center space-x-2 mb-6">
                  <Clock className="h-6 w-6 text-amber-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Continue Watching</h2>
                </div>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {watchingShows.slice(0, 6).map((userShow) => (
                    <div key={userShow.id} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-16 bg-gray-200 rounded flex-shrink-0">
                          {/* Placeholder for poster - would need to fetch media details */}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Show ID: {userShow.tmdb_id}</p>
                          <p className="text-sm text-gray-500">
                            S{userShow.current_season} E{userShow.current_episode}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-8">
            <ActivityFeed userId={user.id} />
            
            {favoriteShows.length > 0 && (
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Heart className="h-5 w-5 text-red-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Your Favorites</h3>
                </div>
                
                <div className="space-y-2">
                  {favoriteShows.slice(0, 5).map((userShow) => (
                    <div key={userShow.id} className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-sm font-medium">Show ID: {userShow.tmdb_id}</p>
                      <p className="text-xs text-gray-500">{userShow.media_type}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};