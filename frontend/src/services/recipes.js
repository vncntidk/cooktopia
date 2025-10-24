// Firestore service for recipe data operations
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit,
  where,
  serverTimestamp,
  increment 
} from 'firebase/firestore';
import { db } from '../config/firebase-config';

const RECIPES_COLLECTION = 'recipes';

/**
 * Create a new recipe in Firestore
 * @param {Object} recipeData - The recipe data to save
 * @param {string} recipeData.title - Recipe title
 * @param {string} recipeData.youtubeLink - YouTube video link
 * @param {Array<string>} recipeData.imageUrls - Array of Cloudinary image URLs
 * @param {string} recipeData.difficulty - Difficulty level (Easy, Medium, Hard)
 * @param {number} recipeData.duration - Duration in minutes
 * @param {Array<string>} recipeData.ingredients - Array of ingredient strings
 * @param {Array<string>} recipeData.steps - Array of step strings
 * @param {string} recipeData.authorId - User ID of the recipe author
 * @param {string} recipeData.authorName - Display name of the recipe author
 * @returns {Promise<string>} - Document ID of the created recipe
 */
export const createRecipe = async (recipeData) => {
  try {
    // Validate required fields
    const requiredFields = ['title', 'description', 'difficulty', 'duration', 'authorId', 'authorName'];
    const missingFields = requiredFields.filter(field => !recipeData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate arrays are not empty
    if (!Array.isArray(recipeData.ingredients) || recipeData.ingredients.length === 0) {
      throw new Error('Ingredients cannot be empty');
    }

    if (!Array.isArray(recipeData.steps) || recipeData.steps.length === 0) {
      throw new Error('Steps cannot be empty');
    }

    // Validate difficulty
    const validDifficulties = ['Easy', 'Medium', 'Hard'];
    if (!validDifficulties.includes(recipeData.difficulty)) {
      throw new Error('Difficulty must be Easy, Medium, or Hard');
    }

    // Validate duration
    if (typeof recipeData.duration !== 'number' || recipeData.duration <= 0) {
      throw new Error('Duration must be a positive number');
    }

    // Prepare recipe document
    const recipeDoc = {
      title: recipeData.title.trim(),
      description: recipeData.description.trim(),
      youtubeLink: recipeData.youtubeLink?.trim() || null,
      imageUrls: Array.isArray(recipeData.imageUrls) ? recipeData.imageUrls : [],
      difficulty: recipeData.difficulty,
      duration: recipeData.duration,
      ingredients: recipeData.ingredients.map(ingredient => ingredient.trim()).filter(ingredient => ingredient),
      steps: recipeData.steps.map(step => step.trim()).filter(step => step),
      authorId: recipeData.authorId,
      authorName: recipeData.authorName.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: 0,
      views: 0,
      isPublished: true
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, RECIPES_COLLECTION), recipeDoc);
    
    console.log('Recipe created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating recipe:', error);
    throw new Error(`Failed to create recipe: ${error.message}`);
  }
};

/**
 * Get all recipes from Firestore
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of recipes to fetch
 * @param {string} options.orderBy - Field to order by (default: 'createdAt')
 * @param {string} options.orderDirection - Order direction ('asc' or 'desc')
 * @returns {Promise<Array>} - Array of recipe documents
 */
export const getAllRecipes = async (options = {}) => {
  try {
    const {
      limit: limitCount = 50,
      orderBy: orderByField = 'createdAt',
      orderDirection = 'desc'
    } = options;

    const q = query(
      collection(db, RECIPES_COLLECTION),
      where('isPublished', '==', true),
      orderBy(orderByField, orderDirection),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const recipes = [];

    querySnapshot.forEach((doc) => {
      recipes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return recipes;
  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw new Error(`Failed to fetch recipes: ${error.message}`);
  }
};

/**
 * Get a single recipe by ID
 * @param {string} recipeId - The recipe document ID
 * @returns {Promise<Object|null>} - Recipe document or null if not found
 */
export const getRecipeById = async (recipeId) => {
  try {
    if (!recipeId) {
      throw new Error('Recipe ID is required');
    }

    const docRef = doc(db, RECIPES_COLLECTION, recipeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching recipe:', error);
    throw new Error(`Failed to fetch recipe: ${error.message}`);
  }
};

/**
 * Get recipes by author ID
 * @param {string} authorId - The author's user ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Array of recipe documents
 */
export const getRecipesByAuthor = async (authorId, options = {}) => {
  try {
    if (!authorId) {
      throw new Error('Author ID is required');
    }

    const {
      limit: limitCount = 20,
      orderBy: orderByField = 'createdAt',
      orderDirection = 'desc'
    } = options;

    const q = query(
      collection(db, RECIPES_COLLECTION),
      where('authorId', '==', authorId),
      where('isPublished', '==', true),
      orderBy(orderByField, orderDirection),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const recipes = [];

    querySnapshot.forEach((doc) => {
      recipes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return recipes;
  } catch (error) {
    console.error('Error fetching recipes by author:', error);
    throw new Error(`Failed to fetch recipes: ${error.message}`);
  }
};

/**
 * Update a recipe
 * @param {string} recipeId - The recipe document ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<void>}
 */
export const updateRecipe = async (recipeId, updateData) => {
  try {
    if (!recipeId) {
      throw new Error('Recipe ID is required');
    }

    const docRef = doc(db, RECIPES_COLLECTION, recipeId);
    
    // Add updated timestamp
    const updateDocData = {
      ...updateData,
      updatedAt: serverTimestamp()
    };

    await updateDoc(docRef, updateDocData);
    console.log('Recipe updated successfully');
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw new Error(`Failed to update recipe: ${error.message}`);
  }
};

/**
 * Delete a recipe
 * @param {string} recipeId - The recipe document ID
 * @returns {Promise<void>}
 */
export const deleteRecipe = async (recipeId) => {
  try {
    if (!recipeId) {
      throw new Error('Recipe ID is required');
    }

    const docRef = doc(db, RECIPES_COLLECTION, recipeId);
    await deleteDoc(docRef);
    console.log('Recipe deleted successfully');
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw new Error(`Failed to delete recipe: ${error.message}`);
  }
};

/**
 * Increment recipe views
 * @param {string} recipeId - The recipe document ID
 * @returns {Promise<void>}
 */
export const incrementRecipeViews = async (recipeId) => {
  try {
    if (!recipeId) {
      throw new Error('Recipe ID is required');
    }

    const docRef = doc(db, RECIPES_COLLECTION, recipeId);
    await updateDoc(docRef, {
      views: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing recipe views:', error);
    // Don't throw error for view increment failures
  }
};
