// Firestore service for recipe ratings
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  getDocs,
  query, 
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase-config';

const RATINGS_COLLECTION = 'ratings';

/**
 * Get a user's rating for a specific recipe
 * @param {string} postId - The recipe/post ID
 * @param {string} userId - The user's UID
 * @returns {Promise<number|null>} - The rating value (1-5) or null if not rated
 */
export const getUserRating = async (postId, userId) => {
  try {
    if (!postId || !userId) {
      return null;
    }

    // Use composite key: postId_userId
    const ratingDocRef = doc(db, RATINGS_COLLECTION, `${postId}_${userId}`);
    const ratingDoc = await getDoc(ratingDocRef);

    if (ratingDoc.exists()) {
      const data = ratingDoc.data();
      return data.value || null;
    }

    return null;
  } catch (error) {
    console.error('Error getting user rating:', error);
    return null;
  }
};

/**
 * Save or update a user's rating for a recipe
 * @param {string} postId - The recipe/post ID
 * @param {string} userId - The user's UID
 * @param {number} value - The rating value (1-5)
 * @returns {Promise<void>}
 */
export const saveUserRating = async (postId, userId, value) => {
  try {
    if (!postId || !userId) {
      throw new Error('Post ID and User ID are required');
    }

    if (!Number.isInteger(value) || value < 1 || value > 5) {
      throw new Error('Rating value must be an integer between 1 and 5');
    }

    // Use composite key: postId_userId
    const ratingDocRef = doc(db, RATINGS_COLLECTION, `${postId}_${userId}`);
    const ratingDoc = await getDoc(ratingDocRef);

    const ratingData = {
      postId,
      userId,
      value,
      updatedAt: serverTimestamp(),
    };

    if (ratingDoc.exists()) {
      // Update existing rating
      await updateDoc(ratingDocRef, ratingData);
    } else {
      // Create new rating
      await setDoc(ratingDocRef, {
        ...ratingData,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error saving user rating:', error);
    throw new Error(`Failed to save rating: ${error.message}`);
  }
};

/**
 * Get average rating and total count for a recipe
 * @param {string} postId - The recipe/post ID
 * @returns {Promise<{average: number, count: number}>} - Average rating and total count
 */
export const getRecipeRatingStats = async (postId) => {
  try {
    if (!postId) {
      return { average: 0, count: 0 };
    }

    const ratingsRef = collection(db, RATINGS_COLLECTION);
    const q = query(ratingsRef, where('postId', '==', postId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { average: 0, count: 0 };
    }

    let total = 0;
    let count = 0;

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.value && Number.isInteger(data.value) && data.value >= 1 && data.value <= 5) {
        total += data.value;
        count += 1;
      }
    });

    const average = count > 0 ? total / count : 0;

    return {
      average: Math.round(average * 10) / 10, // Round to 1 decimal place
      count,
    };
  } catch (error) {
    console.error('Error getting recipe rating stats:', error);
    return { average: 0, count: 0 };
  }
};

