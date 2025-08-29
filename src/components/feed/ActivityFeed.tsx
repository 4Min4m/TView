import React, { useEffect, useState } from 'react';
import { Clock, Heart, Star, Eye, Plus } from 'lucide-react';
import { SocialService } from '../../services/social';
import { tmdbService } from '../../services/tmdb';
import type { Activity, MediaItem } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ActivityFeedProps {
  userId: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ userId }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [mediaCache, setMediaCache] = useState<Map<string, MediaItem>>(new Map());

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const feedActivities = await SocialService.getActivityFeed(userId);
        setActivities(feedActivities);
        
        // Fetch media details for activities
        const mediaPromises = feedActivities
          .filter(activity => activity.tmdb_id && activity.media_type)
          .map(async (activity) => {
            const key = `${activity.tmdb_id}-${activity.media_type}`;
            if (!mediaCache.has(key)) {
              try {
                const media = await tmdbService.getMediaDetails(
                  activity.media_type!,
                  activity.tmdb_id!
                );
                return { key, media };
              } catch (error) {
                console.error('Failed to fetch media:', error);
                return null;
              }
            }
            return null;
          });

        const mediaResults = await Promise.all(mediaPromises);
        const newMediaCache = new Map(mediaCache);
        
        mediaResults.forEach(result => {
          if (result) {
            newMediaCache.set(result.key, result.media);
          }
        });
        
        setMediaCache(newMediaCache);
      } catch (error) {
        console.error('Failed to fetch activity feed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [userId]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'added_to_list':
        return <Plus className="h-4 w-4 text-purple-600" />;
      case 'status_update':
        return <Eye className="h-4 w-4 text-emerald-600" />;
      case 'favorited':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'rated':
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    const user = activity.profiles;
    const media = mediaCache.get(`${activity.tmdb_id}-${activity.media_type}`);
    const title = media?.title || media?.name || 'Unknown';

    switch (activity.type) {
      case 'added_to_list':
        return `${user?.display_name} added ${title} to their ${activity.metadata.status} list`;
      case 'status_update':
        return `${user?.display_name} marked ${title} as ${activity.metadata.status}`;
      case 'favorited':
        return `${user?.display_name} favorited ${title}`;
      case 'rated':
        return `${user?.display_name} rated ${title} ${activity.metadata.rating}/10`;
      default:
        return `${user?.display_name} had some activity`;
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No recent activity from friends</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
      
      <div className="space-y-3">
        {activities.map((activity) => {
          const media = mediaCache.get(`${activity.tmdb_id}-${activity.media_type}`);
          
          return (
            <div key={activity.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    {getActivityText(activity)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatRelativeTime(activity.created_at)}
                  </p>
                </div>

                {media && (
                  <div className="flex-shrink-0">
                    <img
                      src={tmdbService.getImageUrl(media.poster_path, 'w200')}
                      alt={media.title || media.name}
                      className="h-12 w-8 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};