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
import { createNotification } from './notifications';
import { getRecipeById } from './recipes';
import { createActivityLog } from './activityLogs';

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
      // Remove from user's likedRecipes subcollection
      const userLikeRef = doc(db, 'users', userId, 'likedRecipes', recipeId);
      await deleteDoc(userLikeRef).catch(() => {
        // Ignore if it doesn't exist (for backward compatibility)
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
      // Add to user's likedRecipes subcollection for profile page queries
      const userLikeRef = doc(db, 'users', userId, 'likedRecipes', recipeId);
      await setDoc(userLikeRef, {
        recipeId,
        createdAt: serverTimestamp(),
      });

      // Create notification for recipe author
      try {
        console.log('[Like] Fetching recipe to get author ID:', recipeId);
        const recipe = await getRecipeById(recipeId);
        console.log('[Like] Recipe data:', { recipeId, authorId: recipe?.authorId, userId });
        if (recipe?.authorId) {
          console.log('[Like] Creating notification for author:', recipe.authorId);
          const notificationId = await createNotification(recipe.authorId, userId, 'like', {
            relatedPostId: recipeId,
          });
          console.log('[Like] Notification created:', notificationId);
        } else {
          console.warn('[Like] Recipe has no authorId:', recipe);
        }
      } catch (error) {
        console.error('[Like] Error creating like notification:', error);
        // Don't throw - notification failure shouldn't break the like action
      }

      // Create activity log for the user who liked
      try {
        await createActivityLog(userId, 'like_post', {
          targetPostId: recipeId,
        });
      } catch (error) {
        console.error('[Like] Error creating activity log:', error);
        // Don't throw - activity log failure shouldn't break the like action
      }

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
      // Get recipe to store metadata
      const recipe = await getRecipeById(recipeId);
      
      // Save
      await setDoc(saveDocRef, {
        userId,
        createdAt: serverTimestamp(),
      });
      // Also add to user's savedRecipes subcollection with metadata
      const userSaveRef = doc(db, 'users', userId, 'savedRecipes', recipeId);
      await setDoc(userSaveRef, {
        recipeId,
        originalPostId: recipeId,
        originalAuthorId: recipe?.authorId || null,
        savedByUserId: userId,
        isCustomized: false,
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
 * Update a saved recipe with customized fields
 * @param {string} savedRecipeId - The saved recipe document ID in users/{userId}/savedRecipes
 * @param {string} userId - The user's UID
 * @param {Object} customFields - Customized recipe fields
 * @param {string} customFields.title - Custom title
 * @param {string} customFields.description - Custom description
 * @param {Array<string>} customFields.ingredients - Custom ingredients
 * @param {Array<string>} customFields.steps - Custom steps
 * @param {Array<string>} customFields.imageUrls - Custom image URLs
 * @returns {Promise<void>}
 */
export const updateSavedRecipe = async (savedRecipeId, userId, customFields) => {
  try {
    if (!savedRecipeId || !userId) {
      throw new Error('Saved recipe ID and User ID are required');
    }

    const savedRecipeRef = doc(db, 'users', userId, 'savedRecipes', savedRecipeId);
    const updateData = {
      isCustomized: true,
      updatedAt: serverTimestamp(),
    };

    if (customFields.title) {
      updateData.customTitle = customFields.title;
    }
    if (customFields.description) {
      updateData.customDescription = customFields.description;
    }
    if (customFields.ingredients) {
      updateData.customIngredients = customFields.ingredients;
    }
    if (customFields.steps) {
      updateData.customSteps = customFields.steps;
    }
    if (customFields.imageUrls) {
      updateData.customImageUrls = customFields.imageUrls;
    }

    await updateDoc(savedRecipeRef, updateData);
  } catch (error) {
    console.error('Error updating saved recipe:', error);
    throw new Error(`Failed to update saved recipe: ${error.message}`);
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

    // Create notification for recipe author
    try {
      const recipe = await getRecipeById(recipeId);
      if (recipe?.authorId) {
        await createNotification(recipe.authorId, userId, 'comment', {
          relatedPostId: recipeId,
        });
      }
    } catch (error) {
      console.error('Error creating comment notification:', error);
      // Don't throw - notification failure shouldn't break the comment action
    }

    // Create activity log for the user who commented
    try {
      const textSnippet = text.trim().substring(0, 100);
      await createActivityLog(userId, 'comment', {
        targetPostId: recipeId,
        meta: {
          textSnippet,
        },
      });
    } catch (error) {
      console.error('[Comment] Error creating activity log:', error);
      // Don't throw - activity log failure shouldn't break the comment action
    }

    return commentDocRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw new Error(`Failed to add comment: ${error.message}`);
  }
};

/**
 * Toggle like on a comment
 * @param {string} recipeId - The recipe document ID
 * @param {string} commentId - The comment document ID
 * @param {string} userId - The user's UID
 * @returns {Promise<boolean>} - True if liked, false if unliked
 */
export const toggleCommentLike = async (recipeId, commentId, userId) => {
  try {
    if (!recipeId || !commentId || !userId) {
      throw new Error('Recipe ID, Comment ID, and User ID are required');
    }

    const COMMENT_LIKES_COLLECTION = 'likes';
    const likeDocRef = doc(db, RECIPES_COLLECTION, recipeId, COMMENTS_COLLECTION, commentId, COMMENT_LIKES_COLLECTION, userId);
    const likeDoc = await getDoc(likeDocRef);

    if (likeDoc.exists()) {
      // Unlike
      await deleteDoc(likeDocRef);
      // Decrement likes count in comment
      const commentRef = doc(db, RECIPES_COLLECTION, recipeId, COMMENTS_COLLECTION, commentId);
      await updateDoc(commentRef, {
        likes: increment(-1),
      });
      return false;
    } else {
      // Like
      await setDoc(likeDocRef, {
        userId,
        createdAt: serverTimestamp(),
      });
      // Increment likes count in comment
      const commentRef = doc(db, RECIPES_COLLECTION, recipeId, COMMENTS_COLLECTION, commentId);
      await updateDoc(commentRef, {
        likes: increment(1),
      });

      // Create notification for comment author
      try {
        console.log('[Comment Like] Fetching comment to get author ID:', commentId);
        const commentRef = doc(db, RECIPES_COLLECTION, recipeId, COMMENTS_COLLECTION, commentId);
        const commentDoc = await getDoc(commentRef);
        if (commentDoc.exists()) {
          const commentData = commentDoc.data();
          const commentAuthorId = commentData.userId;
          console.log('[Comment Like] Comment data:', { commentId, authorId: commentAuthorId, userId });
          
          if (commentAuthorId && commentAuthorId !== userId) {
            // Get recipe to include in notification
            const recipe = await getRecipeById(recipeId);
            console.log('[Comment Like] Creating notification for comment author:', commentAuthorId);
            const notificationId = await createNotification(commentAuthorId, userId, 'like', {
              relatedPostId: recipeId,
              commentId: commentId, // Store comment ID for reference
            });
            console.log('[Comment Like] Notification created:', notificationId);
          } else {
            console.log('[Comment Like] Skipping notification (self-like or no author)');
          }
        }
      } catch (error) {
        console.error('[Comment Like] Error creating comment like notification:', error);
        // Don't throw - notification failure shouldn't break the like action
      }

      // Create activity log for the user who liked the comment
      try {
        await createActivityLog(userId, 'like_comment', {
          targetPostId: recipeId,
          targetCommentId: commentId,
        });
      } catch (error) {
        console.error('[Comment Like] Error creating activity log:', error);
        // Don't throw - activity log failure shouldn't break the like action
      }

      return true;
    }
  } catch (error) {
    console.error('Error toggling comment like:', error);
    throw new Error(`Failed to toggle comment like: ${error.message}`);
  }
};

/**
 * Delete a comment from a recipe
 * @param {string} recipeId - The recipe document ID
 * @param {string} commentId - The comment document ID
 * @returns {Promise<void>}
 */
export const deleteRecipeComment = async (recipeId, commentId) => {
  try {
    if (!recipeId || !commentId) {
      throw new Error('Recipe ID and Comment ID are required');
    }

    const commentRef = doc(db, RECIPES_COLLECTION, recipeId, COMMENTS_COLLECTION, commentId);
    await deleteDoc(commentRef);

    // Decrement comments count in recipe (if it exists)
    try {
      await updateDoc(doc(db, RECIPES_COLLECTION, recipeId), {
        comments: increment(-1),
      });
    } catch (error) {
      // If comments field doesn't exist, that's okay - just log it
      console.warn('Could not decrement comments count:', error);
    }

    console.log('Comment deleted successfully');
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw new Error(`Failed to delete comment: ${error.message}`);
  }
};

