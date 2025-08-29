import React from 'react';
import { Star, Heart, Plus, Check, Clock } from 'lucide-react';
import { tmdbService } from '../../services/tmdb';
import { useUserShows } from '../../hooks/useUserShows';
import { UserShowsService } from '../../services/userShows';
import type { MediaItem, UserShow } from '../../types';

interface MediaCardProps {
  media: MediaItem;
  userShow?: UserShow;
  onStatusChange?: (status: 'watching' | 'watched' | 'to_watch') => void;
  showActions?: boolean;
}

export const MediaCard: React.FC<MediaCardProps> = ({ 
  media, 
  userShow, 
  onStatusChange,
  showActions = true 
}) => {
  const { addToList, updateStatus, toggleFavorite } = useUserShows();
  const [isLoading, setIsLoading] = useState(false);

  const title = media.title || media.name || '';
  const releaseDate = media.release_date || media.first_air_date || '';
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';

  const handleStatusChange = async (status: 'watching' | 'watched' | 'to_watch') => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (userShow) {
        await updateStatus(media.id, media.media_type, status);
      } else {
        await addToList(media.id, media.media_type, status);
      }
      onStatusChange?.(status);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await toggleFavorite(media.id, media.media_type);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (userShow?.status) {
      case 'watching':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'watched':
        return <Check className="h-4 w-4 text-emerald-500" />;
      default:
        return <Plus className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={tmdbService.getImageUrl(media.poster_path)}
          alt={title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
        
        {showActions && (
          <div className="absolute top-2 right-2 space-y-2">
            <button
              onClick={handleFavoriteToggle}
              disabled={isLoading}
              className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200 shadow-md"
            >
              <Heart 
                className={`h-4 w-4 ${userShow?.favorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
              />
            </button>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {year} • {media.media_type === 'tv' ? 'TV Show' : 'Movie'}
            </p>
          </div>
          
          <div className="flex items-center space-x-1 ml-2">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">
              {media.vote_average.toFixed(1)}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-700 mt-3 line-clamp-2">
          {media.overview}
        </p>

        {showActions && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Status:</span>
              {getStatusIcon()}
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleStatusChange('to_watch')}
                disabled={isLoading}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  userShow?.status === 'to_watch' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-purple-50'
                }`}
              >
                To Watch
              </button>
              <button
                onClick={() => handleStatusChange('watching')}
                disabled={isLoading}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  userShow?.status === 'watching' 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-amber-50'
                }`}
              >
                Watching
              </button>
              <button
                onClick={() => handleStatusChange('watched')}
                disabled={isLoading}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  userShow?.status === 'watched' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-emerald-50'
                }`}
              >
                Watched
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};