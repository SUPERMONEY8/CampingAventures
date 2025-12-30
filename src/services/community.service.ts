/**
 * Community Service
 * 
 * Service for managing community feed posts, interactions, and social features.
 */

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  arrayUnion,
  arrayRemove,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Post, PostComment, PostType, PostVisibility } from '../types';

/**
 * Create a new post
 * 
 * @param post - Post data
 * @returns Post ID
 */
export async function createPost(post: Omit<Post, 'id' | 'timestamp' | 'likes' | 'reactions' | 'comments' | 'shares' | 'bookmarks' | 'reported'>): Promise<string> {
  try {
    const postsRef = collection(db, 'posts');
    const postRef = await addDoc(postsRef, {
      ...post,
      likes: [],
      reactions: [],
      comments: [],
      shares: 0,
      bookmarks: [],
      reported: false,
      timestamp: Timestamp.now(),
    });

    return postRef.id;
  } catch (error) {
    const err = error as Error;
    console.error('Error creating post:', err);
    throw new Error(`Failed to create post: ${err.message}`);
  }
}

/**
 * Get posts with filters
 * 
 * @param filters - Filter options
 * @returns Array of posts
 */
export async function getPosts(filters: {
  userId?: string;
  tripId?: string;
  type?: PostType;
  visibility?: PostVisibility;
  limitCount?: number;
}): Promise<Post[]> {
  try {
    const postsRef = collection(db, 'posts');
    let q = query(postsRef);

    // Apply filters
    if (filters.userId) {
      q = query(q, where('userId', '==', filters.userId));
    }
    if (filters.tripId) {
      q = query(q, where('tripId', '==', filters.tripId));
    }
    if (filters.type) {
      q = query(q, where('type', '==', filters.type));
    }
    if (filters.visibility) {
      q = query(q, where('visibility', '==', filters.visibility));
    }

    // Order by timestamp (newest first)
    q = query(q, orderBy('timestamp', 'desc'));

    // Limit
    if (filters.limitCount) {
      q = query(q, limit(filters.limitCount));
    }

    const snapshot = await getDocs(q);
    const posts: Post[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as DocumentData;
      posts.push({
        id: docSnap.id,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        type: data.type,
        visibility: data.visibility,
        content: data.content,
        photoUrl: data.photoUrl,
        tripId: data.tripId,
        tripTitle: data.tripTitle,
        badgeId: data.badgeId,
        badgeName: data.badgeName,
        badgeIcon: data.badgeIcon,
        milestone: data.milestone,
        stats: data.stats,
        location: data.location,
        taggedUsers: data.taggedUsers || [],
        hashtags: data.hashtags || [],
        likes: data.likes || [],
        reactions: (data.reactions || []).map((r: DocumentData) => ({
          userId: r.userId,
          userName: r.userName,
          emoji: r.emoji,
          timestamp: r.timestamp?.toDate ? r.timestamp.toDate() : new Date(r.timestamp),
        })),
        comments: (data.comments || []).map((c: DocumentData) => ({
          id: c.id,
          userId: c.userId,
          userName: c.userName,
          userAvatar: c.userAvatar,
          content: c.content,
          timestamp: c.timestamp?.toDate ? c.timestamp.toDate() : new Date(c.timestamp),
          likes: c.likes || [],
          replies: c.replies || [],
          replyToId: c.replyToId,
        })),
        shares: data.shares || 0,
        bookmarks: data.bookmarks || [],
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
        editedAt: data.editedAt?.toDate ? data.editedAt.toDate() : (data.editedAt ? new Date(data.editedAt) : undefined),
        reported: data.reported || false,
      });
    });

    return posts;
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching posts:', err);
    throw new Error(`Failed to fetch posts: ${err.message}`);
  }
}

/**
 * Like a post
 * 
 * @param postId - Post ID
 * @param userId - User ID
 */
export async function likePost(postId: string, userId: string): Promise<void> {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDocs(query(collection(db, 'posts'), where('__name__', '==', postId)));
    
    if (!postSnap.empty) {
      const postData = postSnap.docs[0].data() as DocumentData;
      const likes = postData.likes || [];
      
      if (likes.includes(userId)) {
        // Unlike
        await updateDoc(postRef, {
          likes: arrayRemove(userId),
        });
      } else {
        // Like
        await updateDoc(postRef, {
          likes: arrayUnion(userId),
        });
      }
    }
  } catch (error) {
    const err = error as Error;
    console.error('Error liking post:', err);
    throw new Error(`Failed to like post: ${err.message}`);
  }
}

/**
 * Add reaction to post
 * 
 * @param postId - Post ID
 * @param userId - User ID
 * @param userName - User name
 * @param emoji - Emoji reaction
 */
export async function reactToPost(
  postId: string,
  userId: string,
  userName: string,
  emoji: string
): Promise<void> {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      const postData = postDoc.data() as DocumentData;
      const reactions = postData.reactions || [];
      
      // Remove existing reaction from this user
      const filtered = reactions.filter((r: DocumentData) => r.userId !== userId);
      
      // Add new reaction
      filtered.push({
        userId,
        userName,
        emoji,
        timestamp: Timestamp.now(),
      });

      await updateDoc(postRef, {
        reactions: filtered,
      });
    }
  } catch (error) {
    const err = error as Error;
    console.error('Error reacting to post:', err);
    throw new Error(`Failed to react to post: ${err.message}`);
  }
}

/**
 * Comment on a post
 * 
 * @param postId - Post ID
 * @param comment - Comment data
 */
export async function commentPost(
  postId: string,
  comment: Omit<PostComment, 'id' | 'timestamp' | 'likes' | 'replies'>
): Promise<string> {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      const postData = postDoc.data() as DocumentData;
      const comments = postData.comments || [];
      
      const newComment: PostComment = {
        id: `comment-${Date.now()}`,
        ...comment,
        likes: [],
        replies: [],
        timestamp: new Date(),
      };

      comments.push({
        ...newComment,
        timestamp: Timestamp.now(),
      });

      await updateDoc(postRef, {
        comments,
      });

      return newComment.id;
    }

    throw new Error('Post not found');
  } catch (error) {
    const err = error as Error;
    console.error('Error commenting on post:', err);
    throw new Error(`Failed to comment: ${err.message}`);
  }
}

/**
 * Delete a post
 * 
 * @param postId - Post ID
 * @param userId - User ID (for verification)
 */
export async function deletePost(postId: string, userId: string): Promise<void> {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      const postData = postDoc.data() as DocumentData;
      
      // Verify ownership
      if (postData.userId !== userId) {
        throw new Error('Unauthorized: You can only delete your own posts');
      }

      await deleteDoc(postRef);
    }
  } catch (error) {
    const err = error as Error;
    console.error('Error deleting post:', err);
    throw new Error(`Failed to delete post: ${err.message}`);
  }
}

/**
 * Report a post
 * 
 * @param postId - Post ID
 * @param userId - User ID
 * @param reason - Report reason
 */
export async function reportPost(
  postId: string,
  userId: string,
  reason: string
): Promise<void> {
  try {
    // Save report to separate collection
    await addDoc(collection(db, 'postReports'), {
      postId,
      reportedBy: userId,
      reason,
      timestamp: Timestamp.now(),
    });

    // Mark post as reported
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      reported: true,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error reporting post:', err);
    throw new Error(`Failed to report post: ${err.message}`);
  }
}

/**
 * Bookmark a post
 * 
 * @param postId - Post ID
 * @param userId - User ID
 */
export async function bookmarkPost(postId: string, userId: string): Promise<void> {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      const postData = postDoc.data() as DocumentData;
      const bookmarks = postData.bookmarks || [];
      
      if (bookmarks.includes(userId)) {
        // Unbookmark
        await updateDoc(postRef, {
          bookmarks: arrayRemove(userId),
        });
      } else {
        // Bookmark
        await updateDoc(postRef, {
          bookmarks: arrayUnion(userId),
        });
      }
    }
  } catch (error) {
    const err = error as Error;
    console.error('Error bookmarking post:', err);
    throw new Error(`Failed to bookmark post: ${err.message}`);
  }
}

/**
 * Share a post
 * 
 * @param postId - Post ID
 */
export async function sharePost(postId: string): Promise<void> {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      const postData = postDoc.data() as DocumentData;
      const currentShares = postData.shares || 0;

      await updateDoc(postRef, {
        shares: currentShares + 1,
      });
    }
  } catch (error) {
    const err = error as Error;
    console.error('Error sharing post:', err);
    throw new Error(`Failed to share post: ${err.message}`);
  }
}

/**
 * Get bookmarked posts
 * 
 * @param userId - User ID
 * @returns Array of bookmarked posts
 */
export async function getBookmarkedPosts(userId: string): Promise<Post[]> {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('bookmarks', 'array-contains', userId));

    const snapshot = await getDocs(q);
    const posts: Post[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as DocumentData;
      posts.push({
        id: docSnap.id,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        type: data.type,
        visibility: data.visibility,
        content: data.content,
        photoUrl: data.photoUrl,
        tripId: data.tripId,
        tripTitle: data.tripTitle,
        badgeId: data.badgeId,
        badgeName: data.badgeName,
        badgeIcon: data.badgeIcon,
        milestone: data.milestone,
        stats: data.stats,
        location: data.location,
        taggedUsers: data.taggedUsers || [],
        hashtags: data.hashtags || [],
        likes: data.likes || [],
        reactions: data.reactions || [],
        comments: data.comments || [],
        shares: data.shares || 0,
        bookmarks: data.bookmarks || [],
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
        editedAt: data.editedAt?.toDate ? data.editedAt.toDate() : (data.editedAt ? new Date(data.editedAt) : undefined),
        reported: data.reported || false,
      });
    });

    return posts;
  } catch (error) {
    console.error('Error fetching bookmarked posts:', error);
    return [];
  }
}

