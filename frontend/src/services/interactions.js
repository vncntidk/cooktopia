// Firestore service for recipe interactions (likes, comments, saves)
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase-config';

const RECIPES_COLLECTION = 'recipes';
const COMMENTS_COLLECTION = 'comments';
const LIKES_COLLECTION = 'likes';
const SAVES_COLLECTION = 'saves';

/**
 * Get recipe interaction counts (likes, comments, saves)
 * @param {string} recipeId - The recipe document ID
 * @returns {Promise<Object>} - Object with likes, comments, saves counts
 */
export const getRecipeInteractionCounts = async (recipeId) => {
  try {
    if (!recipeId) {
      return { likes: 0, comments: 0, saves: 0 };
    }

    const [likesSnapshot, commentsSnapshot, savesSnapshot] = await Promise.all([
      getDocs(query(collection(db, RECIPES_COLLECTION, recipeId, LIKES_COLLECTION))),
      getDocs(query(collection(db, RECIPES_COLLECTION, recipeId, COMMENTS_COLLECTION))),
      getDocs(query(collection(db, RECIPES_COLLECTION, recipeId, SAVES_COLLECTION))),
    ]);

    return {
      likes: likesSnapshot.size,
      comments: commentsSnapshot.size,
      saves: savesSnapshot.size,
    };
  } catch (error) {
    console.error('Error getting interaction counts:', error);
    return { likes: 0, comments: 0, saves: 0 };
  }
};

/**
 * Toggle like on a recipe
 * @param {string} recipeId - The recipe document ID
 * @param {string} userId - The user's UID
 * @returns {Promise<boolean>} - True if liked, false if unliked
 */
export const toggleRecipeLike = async (recipeId, userId) => {
  try {
    if (!recipeId || !userId) {
      throw new Error('Recipe ID and User ID are required');
    }

    const likeDocRef = doc(db, RECIPES_COLLECTION, recipeId, LIKES_COLLECTION, userId);
    const likeDoc = await getDoc(likeDocRef);

    if (likeDoc.exists()) {
      // Unlike
      await deleteDoc(likeDocRef);
      // Decrement likes count in recipe
      await updateDoc(doc(db, RECIPES_COLLECTION, recipeId), {
        likes: increment(-1),
      });
      return false;
    } else {
      // Like
      await setDoc(likeDocRef, {
        userId,
        createdAt: serverTimestamp(),
      });
      // Increment likes count in recipe
      await updateDoc(doc(db, RECIPES_COLLECTION, recipeId), {
        likes: increment(1),
      });
      return true;
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw new Error(`Failed to toggle like: ${error.message}`);
  }
};

/**
 * Check if user has liked a recipe
 * @param {string} recipeId - The recipe document ID
 * @param {string} userId - The user's UID
 * @returns {Promise<boolean>}
 */
export const hasUserLikedRecipe = async (recipeId, userId) => {
  try {
    if (!recipeId || !userId) {
      return false;
    }

    const likeDocRef = doc(db, RECIPES_COLLECTION, recipeId, LIKES_COLLECTION, userId);
    const likeDoc = await getDoc(likeDocRef);
    return likeDoc.exists();
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
};

/**
 * Toggle save on a recipe
 * @param {string} recipeId - The recipe document ID
 * @param {string} userId - The user's UID
 * @returns {Promise<boolean>} - True if saved, false if unsaved
 */
export const toggleRecipeSave = async (recipeId, userId) => {
  try {
    if (!recipeId || !userId) {
      throw new Error('Recipe ID and User ID are required');
    }

    const saveDocRef = doc(db, RECIPES_COLLECTION, recipeId, SAVES_COLLECTION, userId);
    const saveDoc = await getDoc(saveDocRef);

    if (saveDoc.exists()) {
      // Unsave
      await deleteDoc(saveDocRef);
      // Also remove from user's savedRecipes subcollection
      const userSaveRef = doc(db, 'users', userId, 'savedRecipes', recipeId);
      await deleteDoc(userSaveRef);
      return false;
    } else {
      // Save
      await setDoc(saveDocRef, {
        userId,
        createdAt: serverTimestamp(),
      });
      // Also add to user's savedRecipes subcollection
      const userSaveRef = doc(db, 'users', userId, 'savedRecipes', recipeId);
      await setDoc(userSaveRef, {
        recipeId,
        createdAt: serverTimestamp(),
      });
      return true;
    }
  } catch (error) {
    console.error('Error toggling save:', error);
    throw new Error(`Failed to toggle save: ${error.message}`);
  }
};

/**
 * Check if user has saved a recipe
 * @param {string} recipeId - The recipe document ID
 * @param {string} userId - The user's UID
 * @returns {Promise<boolean>}
 */
export const hasUserSavedRecipe = async (recipeId, userId) => {
  try {
    if (!recipeId || !userId) {
      return false;
    }

    const saveDocRef = doc(db, RECIPES_COLLECTION, recipeId, SAVES_COLLECTION, userId);
    const saveDoc = await getDoc(saveDocRef);
    return saveDoc.exists();
  } catch (error) {
    console.error('Error checking save status:', error);
    return false;
  }
};

/**
 * Get comments for a recipe
 * @param {string} recipeId - The recipe document ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Array of comment documents
 */
export const getRecipeComments = async (recipeId, options = {}) => {
  try {
    if (!recipeId) {
      return [];
    }

    const { limitCount = 50 } = options;
    const commentsRef = collection(db, RECIPES_COLLECTION, recipeId, COMMENTS_COLLECTION);
    const q = query(commentsRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

/**
 * Add a comment to a recipe
 * @param {string} recipeId - The recipe document ID
 * @param {string} userId - The user's UID
 * @param {string} userName - The user's display name
 * @param {string} userAvatar - The user's avatar URL
 * @param {string} text - The comment text
 * @returns {Promise<string>} - Comment document ID
 */
export const addRecipeComment = async (recipeId, userId, userName, userAvatar, text) => {
  try {
    if (!recipeId || !userId || !text?.trim()) {
      throw new Error('Recipe ID, User ID, and comment text are required');
    }

    const commentsRef = collection(db, RECIPES_COLLECTION, recipeId, COMMENTS_COLLECTION);
    const commentDocRef = doc(commentsRef);
    await setDoc(commentDocRef, {
      userId,
      userName,
      userAvatar,
      text: text.trim(),
      likes: 0,
      createdAt: serverTimestamp(),
      replies: [],
    });

    // Increment comments count in recipe
    await updateDoc(doc(db, RECIPES_COLLECTION, recipeId), {
      comments: increment(1),
    });

    return commentDocRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw new Error(`Failed to add comment: ${error.message}`);
  }
};

