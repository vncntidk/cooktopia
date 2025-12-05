/**
 * Follow Service - Firestore v9 modular syntax
 * Uses a flat 'follows' collection structure
 * 
 * Collection: follows
 * Document structure:
 *   - followerId: uid of the user who follows
 *   - followingId: uid of the user being followed
 *   - createdAt: serverTimestamp
 */

import {
  collection,
  doc,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebase-config';
import { ensureConversation } from './messagingService';
import { createNotification } from './notifications';
import { createActivityLog } from './activityLogs';

const FOLLOWS_COLLECTION = 'follows';

/**
 * Ensure a conversation exists between two users when they follow each other
 * @param {string} followerId - The user who follows
 * @param {string} followingId - The user being followed
 * @returns {Promise<void>}
 */
export const ensureConversationOnFollow = async (followerId, followingId) => {
  try {
    if (!followerId || !followingId || followerId === followingId) {
      return;
    }

    // Create conversation if it doesn't exist
    await ensureConversation(followerId, followingId);
  } catch (error) {
    console.error('Error ensuring conversation on follow:', error);
    // Don't throw - conversation creation failure shouldn't break follow
  }
};

/**
 * Follow a user
 * @param {string} currentUserId - The current user's UID
 * @param {string} targetUserId - The user to follow
 * @returns {Promise<void>}
 */
export const followUser = async (currentUserId, targetUserId) => {
  try {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
      throw new Error('Invalid user IDs');
    }

    // Check if follow relationship already exists
    const existingFollow = await isFollowing(currentUserId, targetUserId);
    if (existingFollow) {
      // Already following, do nothing
      return;
    }

    // Create new follow document
    const followsRef = collection(db, FOLLOWS_COLLECTION);
    await addDoc(followsRef, {
      followerId: currentUserId,
      followingId: targetUserId,
      createdAt: serverTimestamp(),
    });

    // Auto-create conversation when user follows another user
    await ensureConversationOnFollow(currentUserId, targetUserId);

    // Create notification for the user being followed
    console.log('[Follow] Creating follow notification:', { follower: currentUserId, following: targetUserId });
    const notificationId = await createNotification(targetUserId, currentUserId, 'follow');
    console.log('[Follow] Notification created:', notificationId);

    // Create activity log for the user who followed
    try {
      await createActivityLog(currentUserId, 'follow', {
        targetUserId: targetUserId,
      });
    } catch (error) {
      console.error('[Follow] Error creating activity log:', error);
      // Don't throw - activity log failure shouldn't break the follow action
    }
  } catch (error) {
    console.error('Error following user:', error);
    throw new Error(`Failed to follow user: ${error.message}`);
  }
};

/**
 * Unfollow a user
 * @param {string} currentUserId - The current user's UID
 * @param {string} targetUserId - The user to unfollow
 * @returns {Promise<void>}
 */
export const unfollowUser = async (currentUserId, targetUserId) => {
  try {
    if (!currentUserId || !targetUserId) {
      throw new Error('User IDs are required');
    }

    // Find the follow document
    const followsRef = collection(db, FOLLOWS_COLLECTION);
    const q = query(
      followsRef,
      where('followerId', '==', currentUserId),
      where('followingId', '==', targetUserId),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Delete the follow document
      const followDoc = querySnapshot.docs[0];
      await deleteDoc(doc(db, FOLLOWS_COLLECTION, followDoc.id));
    }
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw new Error(`Failed to unfollow user: ${error.message}`);
  }
};

/**
 * Check if current user is following target user
 * @param {string} currentUserId - The current user's UID
 * @param {string} targetUserId - The target user's UID
 * @returns {Promise<boolean>}
 */
export const isFollowing = async (currentUserId, targetUserId) => {
  try {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
      return false;
    }

    const followsRef = collection(db, FOLLOWS_COLLECTION);
    const q = query(
      followsRef,
      where('followerId', '==', currentUserId),
      where('followingId', '==', targetUserId),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
};

/**
 * Listen to follow status changes in real-time
 * @param {string} currentUserId - The current user's UID
 * @param {string} targetUserId - The target user's UID
 * @param {Function} callback - Callback function that receives (isFollowing: boolean)
 * @returns {Function} - Unsubscribe function
 */
export const listenToFollowStatus = (currentUserId, targetUserId, callback) => {
  if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
    // Return a no-op unsubscribe function
    return () => {};
  }

  try {
    const followsRef = collection(db, FOLLOWS_COLLECTION);
    const q = query(
      followsRef,
      where('followerId', '==', currentUserId),
      where('followingId', '==', targetUserId),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const isFollowing = !querySnapshot.empty;
        callback(isFollowing);
      },
      (error) => {
        console.error('Error in follow status listener:', error);
        callback(false);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up follow status listener:', error);
    // Return a no-op unsubscribe function
    return () => {};
  }
};

/**
 * Get follower count for a user
 * @param {string} userId - The user's UID
 * @returns {Promise<number>} - Count of followers
 */
export const getFollowerCount = async (userId) => {
  try {
    if (!userId) {
      return 0;
    }

    const followsRef = collection(db, FOLLOWS_COLLECTION);
    const q = query(followsRef, where('followingId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error counting followers:', error);
    return 0;
  }
};

/**
 * Get following count for a user
 * @param {string} userId - The user's UID
 * @returns {Promise<number>} - Count of users being followed
 */
export const getFollowingCount = async (userId) => {
  try {
    if (!userId) {
      return 0;
    }

    const followsRef = collection(db, FOLLOWS_COLLECTION);
    const q = query(followsRef, where('followerId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error counting following:', error);
    return 0;
  }
};

