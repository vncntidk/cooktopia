// Firestore service for user profile data operations
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase-config';
import { auth } from '../config/firebase-config';

const USERS_COLLECTION = 'users';

/**
 * Get user profile data from Firestore
 * @param {string} userId - The user's UID
 * @returns {Promise<Object|null>} - User profile document or null if not found
 */
export const getUserProfile = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return {
        id: userDocSnap.id,
        ...userDocSnap.data()
      };
    } else {
      // Create default profile if it doesn't exist
      // Initialize displayName from auth data if available
      let displayName = null;
      let email = null;
      
      // Try to get displayName from auth if this is the current user
      if (auth.currentUser && auth.currentUser.uid === userId) {
        displayName = auth.currentUser.displayName || null;
        email = auth.currentUser.email || null;
      }
      
      // Fallback to email prefix if no displayName
      if (!displayName && email) {
        displayName = email.split('@')[0];
      }
      
      // Final fallback
      if (!displayName) {
        displayName = `user_${userId.slice(0, 8)}`;
      }
      
      const defaultProfile = {
        bio: 'Add bio',
        displayName: displayName, // Initialize displayName from auth data
        name: displayName, // Also set name field for compatibility
        email: email || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(userDocRef, defaultProfile);
      return {
        id: userId,
        ...defaultProfile
      };
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error(`Failed to fetch user profile: ${error.message}`);
  }
};

/**
 * Update user profile in Firestore
 * @param {string} userId - The user's UID
 * @param {Object} profileData - The profile data to update
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const updateData = {
      ...profileData,
      updatedAt: serverTimestamp()
    };

    // Check if document exists, if not create it
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      await updateDoc(userDocRef, updateData);
    } else {
      // Initialize displayName from auth data if creating new profile
      let displayName = updateData.displayName || null;
      let email = updateData.email || null;
      
      // Try to get displayName from auth if this is the current user
      if (!displayName && auth.currentUser && auth.currentUser.uid === userId) {
        displayName = auth.currentUser.displayName || null;
        email = auth.currentUser.email || email || null;
      }
      
      // Fallback to email prefix if no displayName
      if (!displayName && email) {
        displayName = email.split('@')[0];
      }
      
      // Final fallback
      if (!displayName) {
        displayName = `user_${userId.slice(0, 8)}`;
      }
      
      // Ensure displayName and name are set
      if (!updateData.displayName) {
        updateData.displayName = displayName;
      }
      if (!updateData.name) {
        updateData.name = displayName;
      }
      if (!updateData.bio) {
        updateData.bio = 'Add bio';
      }
      if (!updateData.email && email) {
        updateData.email = email;
      }
      
      await setDoc(userDocRef, {
        ...updateData,
        createdAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error(`Failed to update user profile: ${error.message}`);
  }
};

/**
 * Get count of user's published recipes
 * @param {string} userId - The user's UID
 * @returns {Promise<number>} - Count of recipes
 */
export const getUserRecipeCount = async (userId) => {
  try {
    if (!userId) {
      return 0;
    }

    const recipesRef = collection(db, 'recipes');
    const q = query(
      recipesRef,
      where('authorId', '==', userId),
      where('isPublished', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error counting user recipes:', error);
    return 0;
  }
};

/**
 * Get count of user's followers
 * @param {string} userId - The user's UID
 * @returns {Promise<number>} - Count of followers
 */
export const getUserFollowersCount = async (userId) => {
  try {
    if (!userId) {
      return 0;
    }

    // Use the flat follows collection
    const followsRef = collection(db, 'follows');
    const q = query(followsRef, where('followingId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error counting followers:', error);
    return 0;
  }
};

/**
 * Get count of users this user follows
 * @param {string} userId - The user's UID
 * @returns {Promise<number>} - Count of following
 */
export const getUserFollowingCount = async (userId) => {
  try {
    if (!userId) {
      return 0;
    }

    // Use the flat follows collection
    const followsRef = collection(db, 'follows');
    const q = query(followsRef, where('followerId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error counting following:', error);
    return 0;
  }
};

/**
 * Get list of user's followers with profile data
 * @param {string} userId - The user's UID
 * @returns {Promise<Array>} - Array of follower user objects with profile data
 */
export const getUserFollowersList = async (userId) => {
  try {
    if (!userId) {
      return [];
    }

    // Use the flat follows collection
    const followsRef = collection(db, 'follows');
    const q = query(followsRef, where('followingId', '==', userId));
    const snapshot = await getDocs(q);
    
    const followersPromises = snapshot.docs.map(async (followDoc) => {
      const followerId = followDoc.data().followerId;
      try {
        const profileData = await getUserProfile(followerId);
        return {
          userId: followerId,
          displayName: profileData.displayName || profileData.name || 'user_name',
          email: profileData.email || '',
          profileImage: profileData.profileImage || null,
          bio: profileData.bio || '',
        };
      } catch (error) {
        console.error(`Error fetching follower profile ${followerId}:`, error);
        return {
          userId: followerId,
          displayName: 'user_name',
          email: '',
          profileImage: null,
          bio: '',
        };
      }
    });

    return await Promise.all(followersPromises);
  } catch (error) {
    console.error('Error fetching followers list:', error);
    return [];
  }
};

/**
 * Get list of users this user follows with profile data
 * @param {string} userId - The user's UID
 * @returns {Promise<Array>} - Array of following user objects with profile data
 */
export const getUserFollowingList = async (userId) => {
  try {
    if (!userId) {
      return [];
    }

    // Use the flat follows collection
    const followsRef = collection(db, 'follows');
    const q = query(followsRef, where('followerId', '==', userId));
    const snapshot = await getDocs(q);
    
    const followingPromises = snapshot.docs.map(async (followDoc) => {
      const followingId = followDoc.data().followingId;
      try {
        const profileData = await getUserProfile(followingId);
        return {
          userId: followingId,
          displayName: profileData.displayName || profileData.name || 'user_name',
          email: profileData.email || '',
          profileImage: profileData.profileImage || null,
          bio: profileData.bio || '',
        };
      } catch (error) {
        console.error(`Error fetching following profile ${followingId}:`, error);
        return {
          userId: followingId,
          displayName: 'user_name',
          email: '',
          profileImage: null,
          bio: '',
        };
      }
    });

    return await Promise.all(followingPromises);
  } catch (error) {
    console.error('Error fetching following list:', error);
    return [];
  }
};

/**
 * Search users by display name or username
 * Note: Firestore doesn't support full-text search, so we fetch and filter client-side
 * @param {string} searchTerm - The search term (case-insensitive partial match)
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of users to fetch before filtering (default: 100)
 * @returns {Promise<Array>} - Array of matching user documents with id
 */
export const searchUsers = async (searchTerm, options = {}) => {
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }

    const { limit: limitCount = 100 } = options;
    const searchLower = searchTerm.toLowerCase().trim();

    // Fetch all users (Firestore doesn't have a good way to limit this without indexes)
    // In production, you'd want to use Algolia or similar for user search
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, limit(limitCount));
    
    const querySnapshot = await getDocs(q);
    const users = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const displayName = (data.displayName || data.name || '').toLowerCase();
      const email = (data.email || '').toLowerCase();
      const username = email.split('@')[0] || ''; // Extract username from email if no displayName

      // Check if search term appears in displayName, name, or email username
      if (
        displayName.includes(searchLower) ||
        username.includes(searchLower) ||
        email.includes(searchLower)
      ) {
        users.push({
          id: doc.id,
          ...data,
          // Add username field for compatibility
          username: data.displayName || data.name || username || `user_${doc.id.slice(0, 8)}`,
        });
      }
    });

    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    throw new Error(`Failed to search users: ${error.message}`);
  }
};

