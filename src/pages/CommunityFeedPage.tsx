/**
 * Community Feed Page
 * 
 * Social feed page with posts, interactions, and community features.
 * Instagram/Facebook-inspired design.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Search,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUser';
import {
  getPosts,
  likePost,
  commentPost,
  sharePost,
  bookmarkPost,
  deletePost,
  reportPost,
  createPost,
  getBookmarkedPosts,
} from '../services/community.service';
import { PostCard } from '../components/community/PostCard';
import { CreatePost } from '../components/community/CreatePost';
import { Tabs } from '../components/navigation/Tabs';
import { Card } from '../components/ui/Card';
import type { PostType, PostVisibility } from '../types';

/**
 * Filter type
 */
type FilterType = 'all' | 'my-trips' | 'my-friends' | 'favorites';

/**
 * CommunityFeedPage Component
 */
export function CommunityFeedPage() {
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile(user?.id);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch posts based on filter
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['communityPosts', filter, user?.id],
    queryFn: async () => {
      if (filter === 'favorites') {
        if (!user?.id) return [];
        return await getBookmarkedPosts(user.id);
      }

      const filters: {
        userId?: string;
        visibility?: PostVisibility;
        limitCount?: number;
      } = {};

      if (filter === 'my-trips') {
        // Would need to filter by user's trips
        filters.userId = user?.id;
      }

      if (filter === 'my-friends') {
        filters.visibility = 'friends';
      }

      return await getPosts({
        ...filters,
        limitCount: 50,
      });
    },
    enabled: !!user,
  });

  // Filter posts by search query
  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.content?.toLowerCase().includes(query) ||
      post.userName.toLowerCase().includes(query) ||
      post.tripTitle?.toLowerCase().includes(query) ||
      post.hashtags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  // Mutations
  const likeMutation = useMutation({
    mutationFn: (postId: string) => likePost(postId, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      commentPost(postId, {
        userId: user?.id || '',
        userName: userProfile?.name || 'Unknown',
        userAvatar: userProfile?.avatarUrl,
        content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    },
  });

  const shareMutation = useMutation({
    mutationFn: (postId: string) => sharePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: (postId: string) => bookmarkPost(postId, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (postId: string) => deletePost(postId, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    },
  });

  const reportMutation = useMutation({
    mutationFn: (postId: string) => reportPost(postId, user?.id || '', 'Inappropriate content'),
    onSuccess: () => {
      alert('Post signalé. Merci pour votre vigilance.');
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: {
      type: PostType;
      content?: string;
      photoUrl?: string;
      visibility: PostVisibility;
      location?: string;
      hashtags?: string[];
    }) => {
      // Upload photo if provided
      let photoUrl = postData.photoUrl;
      if (postData.photoUrl && postData.photoUrl.startsWith('data:')) {
        // Would upload to Firebase Storage
        // For now, keep as data URL
      }

      await createPost({
        userId: user?.id || '',
        userName: userProfile?.name || 'Unknown',
        userAvatar: userProfile?.avatarUrl,
        type: postData.type,
        content: postData.content,
        photoUrl,
        visibility: postData.visibility,
        location: postData.location
          ? {
              name: postData.location,
            }
          : undefined,
        hashtags: postData.hashtags,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Communauté
            </h1>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <Tabs
            tabs={[
              { id: 'all', label: 'Tout voir' },
              { id: 'my-trips', label: 'Mes sorties' },
              { id: 'my-friends', label: 'Mes amis' },
              { id: 'favorites', label: 'Mes favoris' },
            ]}
            activeTab={filter}
            onChange={(tab) => setFilter(tab as FilterType)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Chargement des posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucun post
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filter === 'favorites'
                ? 'Vous n\'avez sauvegardé aucun post'
                : 'Soyez le premier à partager !'}
            </p>
            {filter !== 'favorites' && (
              <CreatePost
                onCreate={(postData) => createPostMutation.mutate(postData)}
              />
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PostCard
                  post={post}
                  onLike={(postId) => likeMutation.mutate(postId)}
                  onComment={(postId, content) =>
                    commentMutation.mutate({ postId, content })
                  }
                  onShare={(postId) => shareMutation.mutate(postId)}
                  onBookmark={(postId) => bookmarkMutation.mutate(postId)}
                  onDelete={(postId) => {
                    if (confirm('Voulez-vous vraiment supprimer ce post ?')) {
                      deleteMutation.mutate(postId);
                    }
                  }}
                  onReport={(postId) => {
                    if (confirm('Signaler ce post ?')) {
                      reportMutation.mutate(postId);
                    }
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Post Button */}
      <CreatePost
        onCreate={(postData) => createPostMutation.mutate(postData)}
      />
    </div>
  );
}

