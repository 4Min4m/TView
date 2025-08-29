import React, { useState } from 'react';
import { Clock, Eye, Plus, Heart, Star } from 'lucide-react';
import { useUserShows } from '../hooks/useUserShows';
import { useAuth } from '../contexts/AuthContext';
import type { UserShow } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const MyShowsPage: React.FC = () => {
  const { user } = useAuth();
  const { shows, loading } = useUserShows();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filteredShows = shows.filter(show => {
    switch (activeFilter) {
      case 'watching':
        return show.status === 'watching';
      case 'watched':
        return show.status === 'watched';
      case 'to_watch':
        return show.status === 'to_watch';
      case 'favorites':
        return show.favorite;
      default:
        return true;
    }
  });

  const getStatusCounts = () => {
    return {
      all: shows.length,
      watching: shows.filter(s => s.status === 'watching').length,
      watched: shows.filter(s => s.status === 'watched').length,
      to_watch: shows.filter(s => s.status === 'to_watch').length,
      favorites: shows.filter(s => s.favorite).length,
    };
  };

  const counts = getStatusCounts();

  const filters = [
    { key: 'all', label: 'All', icon: null, count: counts.all },
    { key: 'watching', label: 'Watching', icon: Clock, count: counts.watching },
    { key: 'watched', label: 'Watched', icon: Eye, count: counts.watched },
    { key: 'to_watch', label: 'To Watch', icon: Plus, count: counts.to_watch },
    { key: 'favorites', label: 'Favorites', icon: Heart, count: counts.favorites },
  ];

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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Shows & Movies</h1>
          <div className="text-sm text-gray-500">
            {shows.length} items tracked
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-wrap gap-1 p-1">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeFilter === filter.key
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{filter.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeFilter === filter.key
                      ? 'bg-purple-700 text-purple-100'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {filteredShows.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredShows.map((userShow) => (
              <div key={userShow.id} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {userShow.media_type === 'tv' ? 'TV' : 'Movie'} ID: {userShow.tmdb_id}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {userShow.favorite && (
                      <Heart className="h-4 w-4 text-red-500 fill-current" />
                    )}
                    {userShow.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600">{userShow.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mb-2">
                  Status: <span className="font-medium">{userShow.status}</span>
                </div>
                
                {userShow.media_type === 'tv' && userShow.status === 'watching' && (
                  <div className="text-xs text-gray-500">
                    Progress: S{userShow.current_season} E{userShow.current_episode}
                  </div>
                )}
                
                <div className="text-xs text-gray-400 mt-2">
                  Added: {new Date(userShow.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500">
              {activeFilter === 'all' 
                ? "You haven't added any shows or movies yet. Start exploring!"
                : `No items in your ${filters.find(f => f.key === activeFilter)?.label.toLowerCase()} list.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};