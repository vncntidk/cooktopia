// Firestore service for follow/unfollow functionality
import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase-config';

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

    // Add to current user's following list
    const followingRef = doc(db, 'users', currentUserId, 'following', targetUserId);
    await setDoc(followingRef, {
      userId: targetUserId,
      createdAt: serverTimestamp(),
    });

    // Add to target user's followers list
    const followersRef = doc(db, 'users', targetUserId, 'followers', currentUserId);
    await setDoc(followersRef, {
      userId: currentUserId,
      createdAt: serverTimestamp(),
    });
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

    // Remove from current user's following list
    const followingRef = doc(db, 'users', currentUserId, 'following', targetUserId);
    await deleteDoc(followingRef);

    // Remove from target user's followers list
    const followersRef = doc(db, 'users', targetUserId, 'followers', currentUserId);
    await deleteDoc(followersRef);
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

    const followingRef = doc(db, 'users', currentUserId, 'following', targetUserId);
    const followingDoc = await getDoc(followingRef);
    return followingDoc.exists();
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
};

