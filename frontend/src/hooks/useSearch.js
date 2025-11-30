import { useState, useEffect, useCallback } from 'react';
import { searchRecipesByTitle, searchRecipesByIngredient } from '../services/recipes';
import { searchUsers } from '../services/users';

/**
 * Custom hook for search functionality
 * @param {string} query - Search query string
 * @param {string} mode - Search mode: 'all' | 'recipes' | 'ingredients' | 'users'
 * @param {Object} options - Additional options
 * @param {number} options.debounceMs - Debounce delay in milliseconds (default: 300)
 * @returns {Object} - { results, loading, error }
 */
export const useSearch = (query, mode, options = {}) => {
  const { debounceMs = 300 } = options;
  
  const [results, setResults] = useState({
    recipes: [],
    ingredients: [],
    users: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const performSearch = useCallback(async (searchQuery, searchMode) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setResults({ recipes: [], ingredients: [], users: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const trimmedQuery = searchQuery.trim();

      if (searchMode === 'all') {
        // Run all searches in parallel
        const [recipeResults, ingredientResults, userResults] = await Promise.all([
          searchRecipesByTitle(trimmedQuery),
          searchRecipesByIngredient(trimmedQuery),
          searchUsers(trimmedQuery)
        ]);

        setResults({
          recipes: recipeResults,
          ingredients: ingredientResults,
          users: userResults
        });
      } else if (searchMode === 'recipes') {
        const recipeResults = await searchRecipesByTitle(trimmedQuery);
        setResults({
          recipes: recipeResults,
          ingredients: [],
          users: []
        });
      } else if (searchMode === 'ingredients') {
        const ingredientResults = await searchRecipesByIngredient(trimmedQuery);
        setResults({
          recipes: [],
          ingredients: ingredientResults,
          users: []
        });
      } else if (searchMode === 'users') {
        const userResults = await searchUsers(trimmedQuery);
        setResults({
          recipes: [],
          ingredients: [],
          users: userResults
        });
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'An error occurred while searching');
      setResults({ recipes: [], ingredients: [], users: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Debounce the search
    const timeoutId = setTimeout(() => {
      performSearch(query, mode);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, mode, debounceMs, performSearch]);

  return { results, loading, error };
};

