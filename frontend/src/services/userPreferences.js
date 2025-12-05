// Firestore service for user preferences
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase-config';

const USER_PREFERENCES_COLLECTION = 'userPreferences';

/**
 * Get user preferences
 * @param {string} userId - The user's UID
 * @returns {Promise<Object>} - User preferences object
 */
export const getUserPreferences = async (userId) => {
  try {
    if (!userId) {
      return {};
    }

    const prefsDocRef = doc(db, USER_PREFERENCES_COLLECTION, userId);
    const prefsDoc = await getDoc(prefsDocRef);

    if (prefsDoc.exists()) {
      return prefsDoc.data();
    }

    // Return default preferences if document doesn't exist
    return {};
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return {};
  }
};

/**
 * Update user preferences
 * @param {string} userId - The user's UID
 * @param {Object} preferences - Preferences to update
 * @returns {Promise<void>}
 */
export const updateUserPreferences = async (userId, preferences) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const prefsDocRef = doc(db, USER_PREFERENCES_COLLECTION, userId);
    const prefsDoc = await getDoc(prefsDocRef);

    const updateData = {
      ...preferences,
      updatedAt: serverTimestamp(),
    };

    if (prefsDoc.exists()) {
      await updateDoc(prefsDocRef, updateData);
    } else {
      await setDoc(prefsDocRef, {
        ...updateData,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw new Error(`Failed to update user preferences: ${error.message}`);
  }
};

/**
 * Get last opened notification timestamp
 * @param {string} userId - The user's UID
 * @returns {Promise<Date|null>} - Last opened timestamp or null
 */
export const getLastOpenedNotificationAt = async (userId) => {
  try {
    const preferences = await getUserPreferences(userId);
    return preferences.lastOpenedNotificationAt?.toDate ? preferences.lastOpenedNotificationAt.toDate() : 
           (preferences.lastOpenedNotificationAt ? new Date(preferences.lastOpenedNotificationAt) : null);
  } catch (error) {
    console.error('Error getting last opened notification timestamp:', error);
    return null;
  }
};

/**
 * Update last opened notification timestamp
 * @param {string} userId - The user's UID
 * @returns {Promise<void>}
 */
export const updateLastOpenedNotificationAt = async (userId) => {
  try {
    await updateUserPreferences(userId, {
      lastOpenedNotificationAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating last opened notification timestamp:', error);
    throw error;
  }
};

