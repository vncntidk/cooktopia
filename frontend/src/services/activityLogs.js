/**
 * Activity Logs Service - Firestore v9 modular syntax
 * Handles user activity log creation and retrieval
 * 
 * Collection: activityLogs
 * Document structure:
 *   - userId: uid of the user who performed the activity
 *   - type: 'comment' | 'like_post' | 'like_comment' | 'follow' | 'rating' | 'save'
 *   - targetPostId: recipe/post ID (nullable, for comment/like_post)
 *   - targetCommentId: comment ID (nullable, for like_comment)
 *   - targetUserId: user ID (nullable, for follow)
 *   - meta: object with additional details (e.g., comment text snippet, rating value)
 *   - createdAt: serverTimestamp
 */

import {
  collection,
  doc,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebase-config';
import { getRecipeById } from './recipes';
import { getUserProfile } from './users';

const ACTIVITY_LOGS_COLLECTION = 'activityLogs';

// Debug flag - set to false in production
const DEBUG_ACTIVITY_LOGS = false;

/**
 * Create an activity log entry
 * @param {string} userId - The user who performed the activity
 * @param {string} type - Activity type: 'comment' | 'like_post' | 'like_comment' | 'follow' | 'rating' | 'save'
 * @param {Object} options - Additional options
 * @param {string} options.targetPostId - Recipe/post ID (for comment/like_post)
 * @param {string} options.targetCommentId - Comment ID (for like_comment)
 * @param {string} options.targetUserId - User ID (for follow)
 * @param {Object} options.meta - Additional metadata (e.g., { textSnippet: '...', rating: 5 })
 * @returns {Promise<string>} - Activity log document ID
 */
export const createActivityLog = async (userId, type, options = {}) => {
  try {
    if (!userId || !type) {
      if (DEBUG_ACTIVITY_LOGS) {
        console.warn('[ActivityLog] Missing userId or type:', { userId, type });
      }
      return null;
    }

    const activityLogData = {
      userId,
      type,
      createdAt: serverTimestamp(),
    };

    // Add target IDs based on type
    if (options.targetPostId) {
      activityLogData.targetPostId = options.targetPostId;
    }
    if (options.targetCommentId) {
      activityLogData.targetCommentId = options.targetCommentId;
    }
    if (options.targetUserId) {
      activityLogData.targetUserId = options.targetUserId;
    }
    if (options.meta) {
      activityLogData.meta = options.meta;
    }

    if (DEBUG_ACTIVITY_LOGS) {
      console.log('[ActivityLog] Creating activity log:', { userId, type, activityLogData });
    }
    const activityLogsRef = collection(db, ACTIVITY_LOGS_COLLECTION);
    const docRef = await addDoc(activityLogsRef, activityLogData);
    
    if (DEBUG_ACTIVITY_LOGS) {
      console.log('[ActivityLog] Activity log created successfully:', docRef.id);
    }
    return docRef.id;
  } catch (error) {
    console.error('[ActivityLog] Error creating activity log:', error);
    // Don't throw - activity log failure shouldn't break the main action
    return null;
  }
};

/**
 * Get activity logs for a user
 * @param {string} userId - The user's UID
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of logs to fetch (default: 100)
 * @param {string} options.currentUserId - The logged-in user's UID (for determining "You" vs name)
 * @param {string} options.profileOwnerName - The profile owner's display name (for third-person descriptions)
 * @returns {Promise<Array>} - Array of activity log documents with formatted data
 */
export const getUserActivityLogs = async (userId, options = {}) => {
  try {
    if (!userId) {
      if (DEBUG_ACTIVITY_LOGS) {
        console.warn('[ActivityLog] No userId provided for getUserActivityLogs');
      }
      return [];
    }

    const { limit: limitCount = 100 } = options;

    if (DEBUG_ACTIVITY_LOGS) {
      console.log('[ActivityLog] Fetching activity logs for user:', userId);
    }

    const activityLogsRef = collection(db, ACTIVITY_LOGS_COLLECTION);
    
    let q;
    try {
      // Try query with orderBy (requires composite index)
      q = query(
        activityLogsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      if (DEBUG_ACTIVITY_LOGS) {
        console.log('[ActivityLog] Query successful, found', snapshot.size, 'logs');
      }
      
      const activityLogs = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const activityLog = {
          id: docSnap.id,
          ...data,
        };

        // Format activity description based on type
        try {
          activityLog.description = await formatActivityDescription(
            activityLog,
            options.currentUserId,
            options.profileOwnerName
          );
        } catch (error) {
          console.error('[ActivityLog] Error formatting activity description:', error);
          activityLog.description = 'Activity';
        }

        activityLogs.push(activityLog);
      }

      return activityLogs;
    } catch (queryError) {
      // If composite index is missing, try without orderBy and sort client-side
      if (DEBUG_ACTIVITY_LOGS) {
        console.warn('[ActivityLog] Query with orderBy failed, trying without orderBy:', queryError);
      }
      
      q = query(
        activityLogsRef,
        where('userId', '==', userId),
        limit(limitCount * 2) // Fetch more to account for potential duplicates
      );
      
      const snapshot = await getDocs(q);
      if (DEBUG_ACTIVITY_LOGS) {
        console.log('[ActivityLog] Fallback query successful, found', snapshot.size, 'logs');
      }
      
      const activityLogs = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const activityLog = {
          id: docSnap.id,
          ...data,
        };

        // Format activity description based on type
        try {
          activityLog.description = await formatActivityDescription(
            activityLog,
            options.currentUserId,
            options.profileOwnerName
          );
        } catch (error) {
          console.error('[ActivityLog] Error formatting activity description:', error);
          activityLog.description = 'Activity';
        }

        activityLogs.push(activityLog);
      }

      // Sort client-side by createdAt (newest first)
      activityLogs.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) {
          // If one has a timestamp and the other doesn't, prioritize the one with timestamp
          if (a.createdAt && !b.createdAt) return -1;
          if (!a.createdAt && b.createdAt) return 1;
          return 0;
        }
        try {
          const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
        } catch (error) {
          if (DEBUG_ACTIVITY_LOGS) {
            console.error('[ActivityLog] Error sorting by createdAt:', error, { a: a.createdAt, b: b.createdAt });
          }
          return 0;
        }
      });

      // Limit after sorting
      return activityLogs.slice(0, limitCount);
    }
  } catch (error) {
    console.error('[ActivityLog] Error fetching activity logs:', error);
    return [];
  }
};

/**
 * Format activity description for display
 * @param {Object} activityLog - Activity log document
 * @param {string} currentUserId - The logged-in user's UID (for determining "You" vs name)
 * @param {string} profileOwnerName - The profile owner's display name (for third-person descriptions)
 * @returns {Promise<string>} - Formatted description string
 */
const formatActivityDescription = async (activityLog, currentUserId = null, profileOwnerName = null) => {
  const { type, targetPostId, targetCommentId, targetUserId, userId, meta } = activityLog;
  
  // Determine if we should use "You" or the profile owner's name
  // Use "You" if the profile owner is the logged-in user, otherwise use their name
  const isOwnProfile = currentUserId && userId === currentUserId;
  const actorName = isOwnProfile ? 'You' : (profileOwnerName || 'They');

  switch (type) {
    case 'comment':
      if (targetPostId) {
        try {
          const recipe = await getRecipeById(targetPostId);
          if (recipe) {
            const authorName = recipe.authorName || 'a user';
            const textSnippet = meta?.textSnippet 
              ? `: "${meta.textSnippet.substring(0, 50)}${meta.textSnippet.length > 50 ? '...' : ''}"`
              : '';
            return `${actorName} commented on ${authorName}'s recipe${textSnippet}`;
          }
        } catch (error) {
          console.error('Error fetching recipe for activity log:', error);
        }
      }
      return `${actorName} commented on a recipe`;

    case 'like_post':
      if (targetPostId) {
        try {
          const recipe = await getRecipeById(targetPostId);
          if (recipe) {
            const authorName = recipe.authorName || 'a user';
            return `${actorName} liked ${authorName}'s recipe`;
          }
        } catch (error) {
          console.error('Error fetching recipe for activity log:', error);
        }
      }
      return `${actorName} liked a recipe`;

    case 'like_comment':
      if (targetPostId && targetCommentId) {
        try {
          const recipe = await getRecipeById(targetPostId);
          if (recipe) {
            const authorName = recipe.authorName || 'a user';
            return `${actorName} liked a comment on ${authorName}'s recipe`;
          }
        } catch (error) {
          console.error('Error fetching recipe for activity log:', error);
        }
      }
      return `${actorName} liked a comment`;

    case 'follow':
      if (targetUserId) {
        try {
          const userProfile = await getUserProfile(targetUserId);
          const displayName = userProfile.displayName || userProfile.name || 'a user';
          return `${actorName} followed ${displayName}`;
        } catch (error) {
          console.error('Error fetching user profile for activity log:', error);
        }
      }
      return `${actorName} followed a user`;

    case 'rating':
      if (targetPostId) {
        try {
          const recipe = await getRecipeById(targetPostId);
          if (recipe) {
            const authorName = recipe.authorName || 'a user';
            const rating = meta?.rating || '';
            return `${actorName} rated ${authorName}'s recipe${rating ? ` ${rating} stars` : ''}`;
          }
        } catch (error) {
          console.error('Error fetching recipe for activity log:', error);
        }
      }
      return `${actorName} rated a recipe`;

    case 'save':
      if (targetPostId) {
        try {
          const recipe = await getRecipeById(targetPostId);
          if (recipe) {
            const authorName = recipe.authorName || 'a user';
            return `${actorName} added ${authorName}'s recipe to favorites`;
          }
        } catch (error) {
          console.error('Error fetching recipe for activity log:', error);
        }
      }
      return `${actorName} saved a recipe`;

    default:
      return 'Activity';
  }
};

/**
 * Format timestamp to date string (e.g., "28 August 2025")
 * @param {Object} timestamp - Firestore timestamp
 * @returns {string} - Formatted date string
 */
export const formatActivityDate = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format timestamp to time string (e.g., "22:16")
 * @param {Object} timestamp - Firestore timestamp
 * @returns {string} - Formatted time string
 */
export const formatActivityTime = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

/**
 * Map activity type to UI display type
 * @param {string} type - Activity type from database
 * @returns {string} - UI display type
 */
const mapActivityTypeToUI = (type) => {
  const typeMap = {
    'like_post': 'like',
    'like_comment': 'like',
    'comment': 'comment',
    'follow': 'follow', // Use comment icon for follow (or we could add a follow icon)
    'rating': 'rating',
    'save': 'save',
  };
  return typeMap[type] || 'comment';
};

/**
 * Group activity logs by date
 * @param {Array} activityLogs - Array of activity log documents
 * @returns {Array} - Array of grouped activity logs with date and activities
 */
export const groupActivityLogsByDate = (activityLogs) => {
  const grouped = {};
  
  activityLogs.forEach((log) => {
    const date = formatActivityDate(log.createdAt);
    const time = formatActivityTime(log.createdAt);
    
    if (!grouped[date]) {
      grouped[date] = [];
    }
    
    grouped[date].push({
      id: log.id,
      type: mapActivityTypeToUI(log.type), // Map to UI type
      description: log.description,
      time,
      recipeId: log.targetPostId,
      commentId: log.targetCommentId,
      userId: log.targetUserId,
      createdAt: log.createdAt,
    });
  });
  
  // Convert to array format expected by UI
  // Sort by actual timestamp (newest first) rather than date string
  const sortedDates = Object.keys(grouped).sort((a, b) => {
    // Get the first activity's timestamp from each date group for comparison
    const activitiesA = grouped[a];
    const activitiesB = grouped[b];
    if (activitiesA.length === 0 || activitiesB.length === 0) return 0;
    
    const timestampA = activitiesA[0].createdAt;
    const timestampB = activitiesB[0].createdAt;
    
    if (!timestampA || !timestampB) {
      // If one has a timestamp and the other doesn't, prioritize the one with timestamp
      if (timestampA && !timestampB) return -1;
      if (!timestampA && timestampB) return 1;
      return 0;
    }
    
    try {
      const dateA = timestampA.toDate ? timestampA.toDate() : new Date(timestampA);
      const dateB = timestampB.toDate ? timestampB.toDate() : new Date(timestampB);
      return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
    } catch (error) {
      if (DEBUG_ACTIVITY_LOGS) {
        console.error('[ActivityLog] Error sorting dates:', error);
      }
      return 0;
    }
  });
  
  return sortedDates.map((date) => ({
    date,
    activities: grouped[date].sort((a, b) => {
      // Sort activities within a date by timestamp (newest first)
      if (!a.createdAt || !b.createdAt) {
        // If one has a timestamp and the other doesn't, prioritize the one with timestamp
        if (a.createdAt && !b.createdAt) return -1;
        if (!a.createdAt && b.createdAt) return 1;
        return 0;
      }
      try {
        const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
      } catch (error) {
        if (DEBUG_ACTIVITY_LOGS) {
          console.error('[ActivityLog] Error sorting activities within date:', error);
        }
        return 0;
      }
    }),
  }));
};

