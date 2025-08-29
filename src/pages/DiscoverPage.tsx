import React, { useState, useEffect } from 'react';
import { Film, Tv, Filter } from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import { useUserShows } from '../hooks/useUserShows';
import { MediaCard } from '../components/ui/MediaCard';
import type { MediaItem, Genre } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const DiscoverPage: React.FC = () => {
  const { shows: userShows } = useUserShows();
  const [activeTab, setActiveTab] = useState<'movies' | 'tv'>('movies');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [mediaResults, genreResults] = await Promise.all([
          selectedGenre 
            ? tmdbService.discoverByGenre(activeTab, selectedGenre)
            : activeTab === 'movies' 
              ? tmdbService.getPopularMovies()
              : tmdbService.getPopularTVShows(),
          tmdbService.getGenres(activeTab)
        ]);

        setMedia(mediaResults.results.map(item => ({ ...item, media_type: activeTab })));
        setGenres(genreResults);
      } catch (error) {
        console.error('Failed to fetch discover data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, selectedGenre]);

  const handleGenreChange = (genreId: number | null) => {
    setSelectedGenre(genreId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Discover</h1>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setActiveTab('movies')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'movies' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Film className="h-4 w-4" />
                <span>Movies</span>
              </button>
              <button
                onClick={() => setActiveTab('tv')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'tv' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Tv className="h-4 w-4" />
                <span>TV Shows</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by Genre</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleGenreChange(null)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedGenre === null
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-purple-50 border border-gray-200'
              }`}
            >
              All
            </button>
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => handleGenreChange(genre.id)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedGenre === genre.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-purple-50 border border-gray-200'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {media.map((mediaItem) => {
              const userShow = userShows.find(
                show => show.tmdb_id === mediaItem.id && show.media_type === mediaItem.media_type
              );
              
              return (
                <MediaCard
                  key={`${mediaItem.id}-${mediaItem.media_type}`}
                  media={mediaItem}
                  userShow={userShow}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};