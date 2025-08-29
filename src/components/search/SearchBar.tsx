import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { tmdbService } from '../../services/tmdb';
import type { MediaItem } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface SearchBarProps {
  onResults: (results: MediaItem[]) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onResults, 
  placeholder = "Search movies and TV shows..." 
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchDebounced = async () => {
      if (!query.trim()) {
        onResults([]);
        return;
      }

      setLoading(true);
      try {
        const results = await tmdbService.searchMulti(query);
        // Filter out people and only keep movies/TV shows
        const mediaResults = results.results.filter(item => 
          item.media_type === 'movie' || item.media_type === 'tv'
        );
        onResults(mediaResults);
      } catch (error) {
        console.error('Search error:', error);
        onResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchDebounced, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, onResults]);

  const clearSearch = () => {
    setQuery('');
    onResults([]);
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          placeholder={placeholder}
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          {loading && (
            <div className="pr-3">
              <LoadingSpinner size="sm" />
            </div>
          )}
          {query && (
            <button
              onClick={clearSearch}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};