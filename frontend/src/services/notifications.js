/**
 * Notifications Service - Firestore v9 modular syntax
 * Handles notification creation, fetching, and deletion
 * 
 * Collection: notifications
 * Document structure:
 *   - recipientUserId: uid of the user receiving the notification
 *   - actorUserId: uid of the user who triggered the notification
 *   - type: 'follow' | 'comment' | 'like' | 'message_request' | 'rating'
 *   - relatedPostId: recipe/post ID (nullable, for comment/like notifications)
 *   - messageThreadId: conversation ID (nullable, for message_request notifications)
 *   - createdAt: serverTimestamp
 *   - read: boolean
 *   - deleted: boolean (soft delete)
 */

import {
  collection,
  doc,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  orderBy,
  limit,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase-config';
import { getUserProfile } from './users';
import { getRecipeById } from './recipes';

const NOTIFICATIONS_COLLECTION = 'notifications';

// Debug flag - set to false in production
const DEBUG_NOTIFICATIONS = false;

/**
 * Create a notification
 * @param {string} recipientUserId - The user receiving the notification
 * @param {string} actorUserId - The user who triggered the notification
 * @param {string} type - 'follow' | 'comment' | 'like' | 'message_request' | 'rating'
 * @param {Object} options - Additional options
 * @param {string} options.relatedPostId - Recipe/post ID (for comment/like/rating)
 * @param {string} options.messageThreadId - Conversation ID (for message_request)
 * @param {number} options.ratingValue - Rating value 1-5 (for rating)
 * @returns {Promise<string>} - Notification document ID
 */
export const createNotification = async (recipientUserId, actorUserId, type, options = {}) => {
  try {
    if (DEBUG_NOTIFICATIONS) {
      console.log('[Notification] Creating notification:', { recipientUserId, actorUserId, type, options });
    }
    
    if (!recipientUserId || !actorUserId || !type) {
      if (DEBUG_NOTIFICATIONS) {
        console.error('[Notification] Missing required fields:', { recipientUserId, actorUserId, type });
      }
      throw new Error('Recipient ID, Actor ID, and type are required');
    }

    // Don't create notification if user is notifying themselves
    if (recipientUserId === actorUserId) {
      return null;
    }

    // For like notifications, check if there's an existing notification for this post
    if (type === 'like' && options.relatedPostId) {
      // Find existing like notification for this post
      try {
        const existingLikeQuery = query(
          collection(db, NOTIFICATIONS_COLLECTION),
          where('recipientUserId', '==', recipientUserId),
          where('type', '==', 'like'),
          where('relatedPostId', '==', options.relatedPostId),
          where('deleted', '==', false),
          limit(1)
        );

        const existingLikeSnapshot = await getDocs(existingLikeQuery);
        
        if (!existingLikeSnapshot.empty) {
          // Update existing notification with new actor
          const existingNotification = existingLikeSnapshot.docs[0];
          await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, existingNotification.id), {
            actorUserId,
            createdAt: serverTimestamp(),
            read: false,
          });
          return existingNotification.id;
        }
      } catch (queryError) {
        // Continue to create new notification
        if (DEBUG_NOTIFICATIONS) {
          console.warn('[Notification] Error checking for existing like notification:', queryError);
        }
      }
    }

    // Create new notification
    const notificationData = {
      recipientUserId,
      actorUserId,
      type,
      relatedPostId: options.relatedPostId || null,
      messageThreadId: options.messageThreadId || null,
      ratingValue: options.ratingValue || null, // For rating notifications
      createdAt: serverTimestamp(),
      read: false,
      deleted: false,
    };

    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    const docRef = await addDoc(notificationsRef, notificationData);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    // Don't throw - notification failures shouldn't break the main action
    return null;
  }
};

/**
 * Get notifications for a user
 * @param {string} userId - The user's UID
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of notifications to fetch
 * @param {boolean} options.unreadOnly - Only fetch unread notifications
 * @returns {Promise<Array>} - Array of notification documents with enriched data
 */
export const getUserNotifications = async (userId, options = {}) => {
  try {
    if (!userId) {
      return [];
    }

    const { limitCount = 50, unreadOnly = false } = options;

    let q;
    try {
      if (unreadOnly) {
        q = query(
          collection(db, NOTIFICATIONS_COLLECTION),
          where('recipientUserId', '==', userId),
          where('deleted', '==', false),
          where('read', '==', false),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      } else {
        q = query(
          collection(db, NOTIFICATIONS_COLLECTION),
          where('recipientUserId', '==', userId),
          where('deleted', '==', false),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      }
    } catch (queryError) {
      // If composite index is missing, try without orderBy and sort client-side
      if (DEBUG_NOTIFICATIONS) {
        console.warn('[Notification] Query error, trying alternative:', queryError);
      }
      if (unreadOnly) {
        q = query(
          collection(db, NOTIFICATIONS_COLLECTION),
          where('recipientUserId', '==', userId),
          where('deleted', '==', false),
          where('read', '==', false),
          limit(limitCount)
        );
      } else {
        q = query(
          collection(db, NOTIFICATIONS_COLLECTION),
          where('recipientUserId', '==', userId),
          where('deleted', '==', false),
          limit(limitCount)
        );
      }
    }

    const querySnapshot = await getDocs(q);
    const notifications = [];

    // Enrich notifications with user and post data
    for (const docSnap of querySnapshot.docs) {
      const notificationData = {
        id: docSnap.id,
        ...docSnap.data(),
      };

      // Get actor user profile
      try {
        if (notificationData.actorUserId) {
          const actorProfile = await getUserProfile(notificationData.actorUserId);
          notificationData.actorName = actorProfile?.displayName || actorProfile?.email?.split('@')[0] || 'User';
          notificationData.actorAvatar = actorProfile?.photoURL || null;
        } else {
          notificationData.actorName = 'User';
          notificationData.actorAvatar = null;
        }
      } catch (error) {
        console.error('Error fetching actor profile:', error);
        notificationData.actorName = 'User';
        notificationData.actorAvatar = null;
      }

      // Get post/recipe data for comment/like/rating notifications
      if (notificationData.relatedPostId && (notificationData.type === 'comment' || notificationData.type === 'like' || notificationData.type === 'rating')) {
        try {
          const recipe = await getRecipeById(notificationData.relatedPostId);
          notificationData.postTitle = recipe?.title || 'your post';
        } catch (error) {
          console.error('Error fetching recipe:', error);
          notificationData.postTitle = 'your post';
        }
      }

      notifications.push(notificationData);
    }

    // Sort by createdAt if we couldn't use orderBy in query
    notifications.sort((a, b) => {
      const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return bTime - aTime;
    });

    return notifications;
  } catch (error) {
    if (DEBUG_NOTIFICATIONS) {
      console.error('[Notification] Error fetching notifications:', error);
    }
    return [];
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId - The notification document ID
 * @returns {Promise<void>}
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    if (!notificationId) {
      throw new Error('Notification ID is required');
    }

    await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), {
      read: true,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new Error(`Failed to mark notification as read: ${error.message}`);
  }
};

/**
 * Delete a notification (soft delete)
 * @param {string} notificationId - The notification document ID
 * @returns {Promise<void>}
 */
export const deleteNotification = async (notificationId) => {
  try {
    if (!notificationId) {
      throw new Error('Notification ID is required');
    }

    await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), {
      deleted: true,
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw new Error(`Failed to delete notification: ${error.message}`);
  }
};

/**
 * Listen to user notifications in real-time
 * @param {string} userId - The user's UID
 * @param {Function} callback - Callback function that receives notifications array
 * @param {Object} options - Query options
 * @returns {Function} - Unsubscribe function
 */
export const listenToUserNotifications = (userId, callback, options = {}) => {
  if (!userId) {
    return () => {};
  }

  try {
    const { limitCount = 50, unreadOnly = false } = options;

    let q;
    try {
      if (unreadOnly) {
        q = query(
          collection(db, NOTIFICATIONS_COLLECTION),
          where('recipientUserId', '==', userId),
          where('deleted', '==', false),
          where('read', '==', false),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      } else {
        q = query(
          collection(db, NOTIFICATIONS_COLLECTION),
          where('recipientUserId', '==', userId),
          where('deleted', '==', false),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      }
    } catch (queryError) {
      // If composite index is missing, try without orderBy
      if (DEBUG_NOTIFICATIONS) {
        console.warn('[Notification] Query error in listener:', queryError);
      }
      if (unreadOnly) {
        q = query(
          collection(db, NOTIFICATIONS_COLLECTION),
          where('recipientUserId', '==', userId),
          where('deleted', '==', false),
          where('read', '==', false),
          limit(limitCount)
        );
      } else {
        q = query(
          collection(db, NOTIFICATIONS_COLLECTION),
          where('recipientUserId', '==', userId),
          where('deleted', '==', false),
          limit(limitCount)
        );
      }
    }

    const unsubscribe = onSnapshot(
      q,
      async (querySnapshot) => {
        // First, create raw notifications array immediately (no async delays)
        const rawNotifications = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
          // Set default values immediately so notification appears instantly
          actorName: 'User',
          actorAvatar: null,
          postTitle: 'your post',
        }));

        // Sort by createdAt if we couldn't use orderBy in query
        rawNotifications.sort((a, b) => {
          const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return bTime - aTime;
        });

        // Call callback immediately with raw data so notifications appear instantly
        callback(rawNotifications);

        // Then enrich notifications in parallel (non-blocking)
        const enrichedNotifications = await Promise.all(
          rawNotifications.map(async (notificationData) => {
            const enrichmentPromises = [];

            // Get actor user profile (parallel)
            if (notificationData.actorUserId) {
              enrichmentPromises.push(
                getUserProfile(notificationData.actorUserId)
                  .then((actorProfile) => {
                    notificationData.actorName = actorProfile?.displayName || actorProfile?.email?.split('@')[0] || 'User';
                    notificationData.actorAvatar = actorProfile?.profileImage || actorProfile?.photoURL || null;
                  })
                  .catch((error) => {
                    console.error('Error fetching actor profile:', error);
                    notificationData.actorName = 'User';
                    notificationData.actorAvatar = null;
                  })
              );
            }

            // Get post/recipe data for comment/like/rating notifications (parallel)
            if (notificationData.relatedPostId && (notificationData.type === 'comment' || notificationData.type === 'like' || notificationData.type === 'rating')) {
              enrichmentPromises.push(
                getRecipeById(notificationData.relatedPostId)
                  .then((recipe) => {
                    notificationData.postTitle = recipe?.title || 'your post';
                  })
                  .catch((error) => {
                    console.error('Error fetching recipe:', error);
                    notificationData.postTitle = 'your post';
                  })
              );
            }

            // Wait for all enrichment for this notification to complete
            await Promise.all(enrichmentPromises);

            return notificationData;
          })
        );

        // Update with enriched data (this will trigger a re-render with full data)
        callback(enrichedNotifications);
      },
      (error) => {
        console.error('Error in notifications listener:', error);
        callback([]);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up notifications listener:', error);
    return () => {};
  }
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - The user's UID
 * @param {Array<string>} notificationIds - Optional array of specific notification IDs to mark as read
 * @returns {Promise<void>}
 */
export const markAllNotificationsAsRead = async (userId, notificationIds = null) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    let notificationsToUpdate = [];
    
    if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      notificationsToUpdate = notificationIds;
    } else {
      // Mark all unread notifications as read
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('recipientUserId', '==', userId),
        where('deleted', '==', false),
        where('read', '==', false),
        limit(500) // Firestore batch limit is 500
      );

      const querySnapshot = await getDocs(q);
      notificationsToUpdate = querySnapshot.docs.map(doc => doc.id);
    }

    if (notificationsToUpdate.length === 0) {
      return;
    }

    // Use batch write for efficiency
    const batch = writeBatch(db);
    notificationsToUpdate.forEach((notificationId) => {
      const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
      batch.update(notificationRef, { read: true });
    });

    await batch.commit();
  } catch (error) {
    console.error('[Notification] Error marking all notifications as read:', error);
    throw new Error(`Failed to mark notifications as read: ${error.message}`);
  }
};

/**
 * Get unread notification count
 * @param {string} userId - The user's UID
 * @returns {Promise<number>} - Count of unread notifications
 */
export const getUnreadNotificationCount = async (userId) => {
  try {
    if (!userId) {
      return 0;
    }

    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('recipientUserId', '==', userId),
      where('deleted', '==', false),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error counting unread notifications:', error);
    return 0;
  }
};

/**
 * Listen to unread notification count in real-time (based on timestamp, like messages)
 * @param {string} userId - The user's UID
 * @param {Function} callback - Callback function that receives the count
 * @param {Date|null} lastOpenedAt - Timestamp of when notifications were last opened (optional)
 * @returns {Function} - Unsubscribe function
 */
export const listenToUnreadNotificationCount = (userId, callback, lastOpenedAt = null) => {
  if (!userId) {
    return () => {};
  }

  try {
    // If lastOpenedAt is provided, count notifications created after that timestamp
    // Otherwise, count all unread notifications (backward compatibility)
    let q;
    if (lastOpenedAt) {
      // Count notifications created after lastOpenedAt
      q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('recipientUserId', '==', userId),
        where('deleted', '==', false),
        orderBy('createdAt', 'desc')
      );
    } else {
      // Fallback to unread count (for backward compatibility)
      q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('recipientUserId', '==', userId),
        where('deleted', '==', false),
        where('read', '==', false)
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        let count = 0;
        
        if (lastOpenedAt) {
          // Count notifications created after lastOpenedAt
          const lastOpenedTime = lastOpenedAt instanceof Date ? lastOpenedAt.getTime() : new Date(lastOpenedAt).getTime();
          querySnapshot.docs.forEach((docSnap) => {
            const data = docSnap.data();
            const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().getTime() : 
                           (data.createdAt ? new Date(data.createdAt).getTime() : 0);
            if (createdAt > lastOpenedTime) {
              count++;
            }
          });
        } else {
          // Count all unread notifications
          count = querySnapshot.size;
        }
        
        callback(count);
      },
      (error) => {
        console.error('[Notification] Error in unread count listener:', error);
        callback(0);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('[Notification] Error setting up unread count listener:', error);
    return () => {};
  }
};

