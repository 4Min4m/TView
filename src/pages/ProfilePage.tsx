import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Users, UserPlus, UserMinus, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SocialService } from '../services/social';
import { supabase } from '../lib/supabase';
import { useUserShows } from '../hooks/useUserShows';
import type { User } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const { shows } = useUserShows(profileUser?.id);
  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (error) throw error;
        setProfileUser(profile);

        // Fetch social data
        const [followers, following, followStatus] = await Promise.all([
          SocialService.getFollowers(profile.id),
          SocialService.getFollowing(profile.id),
          currentUser ? SocialService.isFollowing(profile.id) : Promise.resolve(false)
        ]);

        setFollowersCount(followers.length);
        setFollowingCount(following.length);
        setIsFollowing(followStatus);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser || !profileUser || isOwnProfile) return;

    try {
      if (isFollowing) {
        await SocialService.unfollowUser(profileUser.id);
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
      } else {
        await SocialService.followUser(profileUser.id);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const watchingShows = shows.filter(show => show.status === 'watching');
  const watchedShows = shows.filter(show => show.status === 'watched');
  const favoriteShows = shows.filter(show => show.favorite);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="h-24 w-24 bg-gradient-to-br from-purple-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profileUser.display_name.charAt(0).toUpperCase()}
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profileUser.display_name}</h1>
                <p className="text-gray-600 mb-2">@{profileUser.username}</p>
                
                {profileUser.bio && (
                  <p className="text-gray-700 mb-4 max-w-md">{profileUser.bio}</p>
                )}

                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(profileUser.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span><strong>{followersCount}</strong> followers</span>
                    <span><strong>{followingCount}</strong> following</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {!isOwnProfile && currentUser && (
                <button
                  onClick={handleFollowToggle}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {isFollowing ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  <span>{isFollowing ? 'Unfollow' : 'Follow'}</span>
                </button>
              )}
              
              {isOwnProfile && (
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                  <Settings className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Currently Watching</span>
                  <span className="font-medium">{watchingShows.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium">{watchedShows.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Favorites</span>
                  <span className="font-medium">{favoriteShows.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Tracked</span>
                  <span className="font-medium">{shows.length}</span>
                </div>
              </div>
            </div>

            {favoriteShows.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Favorites</h3>
                <div className="space-y-3">
                  {favoriteShows.slice(0, 5).map((show) => (
                    <div key={show.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">TMDb ID: {show.tmdb_id}</p>
                        <p className="text-xs text-gray-500">{show.media_type}</p>
                      </div>
                      {show.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs">{show.rating}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {filters.map((filter) => {
                    const Icon = filter.icon;
                    return (
                      <button
                        key={filter.key}
                        onClick={() => setActiveFilter(filter.key)}
                        className={`flex items-center space-x-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                          activeFilter === filter.key
                            ? 'border-purple-600 text-purple-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        <span>{filter.label}</span>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          {filter.count}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-6">
                {filteredShows.length > 0 ? (
                  <div className="space-y-4">
                    {filteredShows.map((show) => (
                      <div key={show.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-16 bg-gray-200 rounded flex-shrink-0">
                              {/* Placeholder for poster */}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">TMDb ID: {show.tmdb_id}</p>
                              <p className="text-sm text-gray-500">{show.media_type}</p>
                              <p className="text-xs text-gray-400">
                                Status: {show.status}
                                {show.media_type === 'tv' && show.status === 'watching' && (
                                  <span> • S{show.current_season} E{show.current_episode}</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {show.favorite && (
                            <Heart className="h-4 w-4 text-red-500 fill-current" />
                          )}
                          {show.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm">{show.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No shows in this category
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};