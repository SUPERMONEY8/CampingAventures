/**
 * Post Card Component
 * 
 * Generic card component for displaying community feed posts.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical,
  MapPin,
  Flag,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatRelativeTime } from '../../utils/date';
import type { Post } from '../../types';

/**
 * PostCard props
 */
interface PostCardProps {
  /**
   * Post data
   */
  post: Post;

  /**
   * On like handler
   */
  onLike?: (postId: string) => void;

  /**
   * On comment handler
   */
  onComment?: (postId: string, content: string) => void;

  /**
   * On share handler
   */
  onShare?: (postId: string) => void;

  /**
   * On bookmark handler
   */
  onBookmark?: (postId: string) => void;

  /**
   * On delete handler
   */
  onDelete?: (postId: string) => void;

  /**
   * On report handler
   */
  onReport?: (postId: string) => void;
}

/**
 * PostCard Component
 */
export function PostCard({
  post,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onDelete,
  onReport,
}: PostCardProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [isLiked, setIsLiked] = useState(post.likes.includes(user?.id || ''));
  const [isBookmarked, setIsBookmarked] = useState(post.bookmarks.includes(user?.id || ''));

  /**
   * Handle like
   */
  const handleLike = (): void => {
    setIsLiked(!isLiked);
    onLike?.(post.id);
  };

  /**
   * Handle bookmark
   */
  const handleBookmark = (): void => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(post.id);
  };

  /**
   * Handle comment submit
   */
  const handleCommentSubmit = (): void => {
    if (commentInput.trim()) {
      onComment?.(post.id, commentInput);
      setCommentInput('');
    }
  };

  /**
   * Render post content based on type
   */
  const renderPostContent = (): React.ReactElement => {
    switch (post.type) {
      case 'trip_completion':
        return (
          <div className="space-y-4">
            {post.photoUrl && (
              <img
                src={post.photoUrl}
                alt={post.tripTitle}
                className="w-full h-64 object-cover rounded-lg"
              />
            )}
            {post.stats && (
              <div className="grid grid-cols-3 gap-2">
                {post.stats.distance && (
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">{post.stats.distance.toFixed(1)} km</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Distance</p>
                  </div>
                )}
                {post.stats.points && (
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">+{post.stats.points} pts</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Points</p>
                  </div>
                )}
                {post.stats.activitiesCompleted && (
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">{post.stats.activitiesCompleted}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Activités</p>
                  </div>
                )}
              </div>
            )}
            {post.tripId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = `/trips/${post.tripId}/report`}
                className="w-full"
              >
                Voir le rapport
              </Button>
            )}
          </div>
        );

      case 'badge_unlock':
        return (
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-6xl mb-4"
            >
              {post.badgeIcon || '🏆'}
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {post.badgeName}
            </h3>
            {post.content && (
              <p className="text-gray-600 dark:text-gray-400">{post.content}</p>
            )}
          </div>
        );

      case 'milestone':
        return (
          <div className="text-center py-6">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Niveau {post.milestone?.level} atteint !
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {post.milestone?.points} points totaux
            </p>
            {post.content && (
              <p className="text-gray-600 dark:text-gray-400">{post.content}</p>
            )}
          </div>
        );

      case 'photo':
        return (
          <div className="space-y-3">
            {post.photoUrl && (
              <img
                src={post.photoUrl}
                alt={post.content || 'Photo'}
                className="w-full rounded-lg"
              />
            )}
            {post.content && (
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {post.content}
              </p>
            )}
            {post.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{post.location.name}</span>
              </div>
            )}
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag) => (
                  <span key={tag} className="text-primary text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return (
          <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
            {post.content}
          </p>
        );
    }
  };

  const isOwner = post.userId === user?.id;

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            {post.userAvatar ? (
              <img
                src={post.userAvatar}
                alt={post.userName}
                className="w-full h-full rounded-full"
              />
            ) : (
              <span className="text-sm font-semibold text-primary">
                {post.userName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {post.userName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatRelativeTime(post.timestamp)}
            </p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-10"
              >
                {isOwner ? (
                  <button
                    onClick={() => {
                      onDelete?.(post.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onReport?.(post.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <Flag className="w-4 h-4" />
                    <span>Signaler</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        {renderPostContent()}
      </div>

      {/* Footer - Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <motion.div
              animate={{ scale: isLiked ? [1, 1.3, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Heart
                className={`w-5 h-5 ${
                  isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'
                }`}
              />
            </motion.div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {post.likes.length}
            </span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {post.comments.length}
            </span>
          </button>
          <button
            onClick={() => onShare?.(post.id)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {post.shares}
            </span>
          </button>
        </div>
        <button
          onClick={handleBookmark}
          className="hover:opacity-80 transition-opacity"
        >
          <Bookmark
            className={`w-5 h-5 ${
              isBookmarked
                ? 'fill-primary text-primary'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          />
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            {/* Comments List */}
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto scrollbar-hide">
              {post.comments.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Aucun commentaire
                </p>
              ) : (
                post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      {comment.userAvatar ? (
                        <img
                          src={comment.userAvatar}
                          alt={comment.userName}
                          className="w-full h-full rounded-full"
                        />
                      ) : (
                        <span className="text-xs">
                          {comment.userName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {comment.userName}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {comment.content}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatRelativeTime(comment.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCommentSubmit();
                  }
                }}
                placeholder="Ajouter un commentaire..."
                className="flex-1 medical-input text-sm"
              />
              <Button
                size="sm"
                variant="primary"
                onClick={handleCommentSubmit}
                disabled={!commentInput.trim()}
              >
                Publier
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

