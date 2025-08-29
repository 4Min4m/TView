import React, { useState } from 'react';
import { SearchBar } from '../components/search/SearchBar';
import { MediaCard } from '../components/ui/MediaCard';
import { useUserShows } from '../hooks/useUserShows';
import type { MediaItem } from '../types';

export const SearchPage: React.FC = () => {
  const { shows: userShows } = useUserShows();
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Search</h1>
          <SearchBar onResults={setSearchResults} />
        </div>

        {searchResults.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {searchResults.map((media) => {
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
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500">Start typing to search for movies and TV shows...</p>
          </div>
        )}
      </div>
    </div>
  );
};