import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import HeaderSidebarLayout from "../components/HeaderSidebarLayout";
import { Bookmark } from "lucide-react";
import styles from "../components/Component.module.css";
import ViewPostModal from "../modals/ViewPostModal";
import Avatar from "../components/Avatar";
import { useAuth } from "../contexts/AuthContext";
import { useSearch } from "../hooks/useSearch";
import { getUserFollowersCount, getUserFollowingCount } from "../services/users";
import { getRecipeInteractionCounts } from "../services/interactions";

// User Card Component - styled like homepage cards
function UserCard({ user }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(user.followers || 0);
  const [followingCount, setFollowingCount] = useState(user.following || 0);
  const navigate = useNavigate();

  // Load follower/following counts
  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [followers, following] = await Promise.all([
          getUserFollowersCount(user.id),
          getUserFollowingCount(user.id)
        ]);
        setFollowersCount(followers);
        setFollowingCount(following);
      } catch (error) {
        console.error('Error loading user counts:', error);
      }
    };
    loadCounts();
  }, [user.id]);

  const handleFollowToggle = (e) => {
    e.stopPropagation();
    setIsFollowing(!isFollowing);
    // TODO: Implement actual follow/unfollow logic
  };

  const handleCardClick = () => {
    navigate(`/profile/${user.id}`);
  };

  const username = user.username || user.displayName || user.name || `user_${user.id.slice(0, 8)}`;

  return (
    <article
      className={`${styles.recipeCards} break-inside-avoid group relative rounded-xl transition-all duration-300 overflow-hidden cursor-pointer bg-white shadow-md hover:shadow-lg`}
      onClick={handleCardClick}
    >
      <div className="flex flex-col p-6">
        {/* Header with Avatar and Username */}
        <div className="flex items-center gap-3 mb-4 h-15"style={{marginLeft: 10}}>
          <Avatar
            userId={user.id}
            displayName={username}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              @{username}
            </h3>
            <p className="text-xs text-gray-500">
              {followersCount} followers • {followingCount} following
            </p>
          </div>
        </div>
        
        {/* Follow Button */}
        <button
          onClick={handleFollowToggle}
          className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
            isFollowing
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
              : "bg-[#FE982A] text-white hover:bg-orange-600 shadow-sm hover:shadow-md"
          }`}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
      </div>
    </article>
  );
}

// Recipe Card Component - exactly matching HomePage style
function RecipeCard({ recipe }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleToggleSave = (e) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    // TODO: Implement actual save/unsave logic
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
    if (recipe.authorId) {
      navigate(`/profile/${recipe.authorId}`);
    }
  };

  // Transform Firestore recipe to match component expectations
  const recipeImage = Array.isArray(recipe.imageUrls) && recipe.imageUrls.length > 0
    ? recipe.imageUrls[0]
    : recipe.img || '/posts/placeholder.jpg';
  const authorName = recipe.authorName || recipe.user || 'Unknown';

  return (
    <>
      <article
        className={`${styles.recipeCards} break-inside-avoid group relative rounded-xl transition-all duration-300 overflow-hidden`}
      >
        <div className={`${styles.recipeCards} overflow-hidden rounded-xl`}>
          <img
            src={recipeImage}
            loading="lazy"
            className="w-full h-auto object-cover transform group-hover:scale-105 group-hover:brightness-60 transition-transform duration-500"
            alt={recipe.title || 'Recipe'}
          />
        </div>

        {/* Save Icon - Only bookmark appears on hover (matching HomeFeed) */}
        <div className="absolute top-4 right-5 opacity-0 group-hover:opacity-100 transition z-20">
          <button
            onClick={handleToggleSave}
            className="flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full w-10 h-10 shadow-md hover:bg-white transition"
            disabled={!user?.uid}
            aria-label={isSaved ? 'Unsave recipe' : 'Save recipe'}
          >
            <Bookmark 
              className={`w-5 h-5 ${isSaved ? 'fill-orange-500 text-orange-500' : 'text-gray-700'}`} 
            />
          </button>
        </div>

        {/* VIEW RECIPE BUTTON */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 w-10/13 shadow-md h-8 text-sm font-medium bg-white rounded-md opacity-0 group-hover:opacity-100 transition
                group-hover:translate-y-0 translate-y-2 hover:shadow-md hover:rounded-md hover:bg-[#FE982A] hover:text-white duration-300 z-10"
        >
          View Recipe
        </button>

        {/* Username tag - clickable (matching HomeFeed exactly) */}
        <button
          onClick={(e) => {
            if (recipe.authorId) {
              handleProfileClick(e);
            }
          }}
          className="p-6 flex items-center gap-2 text-gray-700 text-sm bg-white/50 backdrop-blur-sm hover:bg-white/70 transition w-full text-left"
        >
          <Avatar
            userId={recipe.authorId}
            displayName={authorName}
            size="sm"
          />
          <span>@{authorName}</span>
        </button>
      </article>

      {/* View Recipe Modal */}
      {isModalOpen && (
        <ViewPostModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          recipe={recipe}
        />
      )}
    </>
  );
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchMode, setSearchMode] = useState("all"); // 'all' | 'recipes' | 'ingredients' | 'users'

  const query = searchParams.get("q") || "";
  
  // Initialize mode from URL params if present, otherwise default to 'all'
  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam && ["all", "recipes", "ingredients", "users"].includes(modeParam)) {
      setSearchMode(modeParam);
    } else {
      setSearchMode("all");
    }
  }, [searchParams]);

  // Use the search hook - only search when there's a query
  const { results, loading, error } = useSearch(
    query.trim().length > 0 ? query : "",
    searchMode,
    { debounceMs: 300 }
  );

  // Handle mode change
  const handleModeChange = (mode) => {
    setSearchMode(mode);
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    newParams.set("mode", mode);
    setSearchParams(newParams);
  };

  // Get results based on current mode
  const getDisplayResults = () => {
    switch (searchMode) {
      case "recipes":
        return { recipes: results.recipes, ingredients: [], users: [] };
      case "ingredients":
        return { recipes: [], ingredients: results.ingredients, users: [] };
      case "users":
        return { recipes: [], ingredients: [], users: results.users };
      case "all":
      default:
        // In 'all' mode, deduplicate recipes that appear in both title and ingredient results
        const recipeIds = new Set(results.recipes.map(r => r.id));
        const uniqueIngredientResults = results.ingredients.filter(r => !recipeIds.has(r.id));
        return { 
          recipes: results.recipes, 
          ingredients: uniqueIngredientResults, 
          users: results.users 
        };
    }
  };

  const displayResults = getDisplayResults();
  const hasResults = displayResults.recipes.length > 0 || 
                     displayResults.ingredients.length > 0 || 
                     displayResults.users.length > 0;

  return (
    <HeaderSidebarLayout>
      <div className={`${styles.contentWrapper} px-4 w-24/25 flex justify-evenly`}>
        <div className="w-full max-w-[1350px]">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              {query ? `Search results for "${query}"` : "Search"}
            </h1>
            
            {/* Filter Tabs - Improved styling */}
            <div className="flex gap-3 mb-6 flex-wrap"style={{marginTop: 20}}>
              {["all", "recipes", "ingredients", "users"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleModeChange(mode)}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-semibold leading-normal transition-all duration-300 min-h-[35px] w-[95px] flex items-center justify-center ${
                    searchMode === mode
                      ? "bg-[#FE982A] text-white shadow-md hover:bg-orange-600"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {/* Results Count */}
            {query && (
              <p className="text-gray-600 mb-6"style={{marginTop: 10}}>
                {loading ? (
                  "Searching..."
                ) : error ? (
                  <span className="text-red-500">Error: {error}</span>
                ) : (
                  <>
                    {searchMode === "all" && (
                      <>
                        {displayResults.recipes.length + displayResults.ingredients.length + displayResults.users.length} result(s)
                      </>
                    )}
                    {searchMode === "recipes" && (
                      <>{displayResults.recipes.length} recipe(s) found</>
                    )}
                    {searchMode === "ingredients" && (
                      <>{displayResults.ingredients.length} recipe(s) with this ingredient</>
                    )}
                    {searchMode === "users" && (
                      <>{displayResults.users.length} user(s) found</>
                    )}
                  </>
                )}
              </p>
            )}
          </div>

          {/* Results */}
          {!query ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-xl text-gray-500">Enter a search query to get started</p>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
              <p className="text-xl text-gray-500">Searching...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-xl text-red-500 mb-2">Error searching</p>
              <p className="text-gray-500">{error}</p>
            </div>
          ) : hasResults ? (
            <div>
              {/* All Mode - Grouped Results */}
              {searchMode === "all" && (
                <>
                  {/* Recipes Section */}
                  {displayResults.recipes.length > 0 && (
                    <div className="mb-16">
                      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Recipes</h2>
                      <div className="columns-2 md:columns-3 lg:columns-4 gap-2 space-y-6">
                        {displayResults.recipes.map((recipe) => (
                          <RecipeCard key={recipe.id} recipe={recipe} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recipes with this ingredient Section */}
                  {displayResults.ingredients.length > 0 && (
                    <div className="mb-16">
                      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                        Recipes with this ingredient
                      </h2>
                      <div className="columns-2 md:columns-3 lg:columns-4 gap-2 space-y-6">
                        {displayResults.ingredients.map((recipe) => (
                          <RecipeCard key={recipe.id} recipe={recipe} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Users Section */}
                  {displayResults.users.length > 0 && (
                    <div className="mb-16">
                      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Users</h2>
                      <div className="columns-2 md:columns-3 lg:columns-4 gap-2 space-y-6">
                        {displayResults.users.map((user) => (
                          <UserCard key={user.id} user={user} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Recipes Mode */}
              {searchMode === "recipes" && displayResults.recipes.length > 0 && (
                <div className="columns-2 md:columns-3 lg:columns-4 gap-2 space-y-6">
                  {displayResults.recipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              )}

              {/* Ingredients Mode */}
              {searchMode === "ingredients" && displayResults.ingredients.length > 0 && (
                <div className="columns-2 md:columns-3 lg:columns-4 gap-2 space-y-6">
                  {displayResults.ingredients.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              )}

              {/* Users Mode */}
              {searchMode === "users" && displayResults.users.length > 0 && (
                <div className="columns-2 md:columns-3 lg:columns-4 gap-2 space-y-6">
                  {displayResults.users.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            // No Results
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-2xl text-gray-500 mb-4">
                No results found for "{query}"
              </p>
              <p className="text-gray-400">
                Try adjusting your search or changing the filter
              </p>
            </div>
          )}
        </div>
      </div>
    </HeaderSidebarLayout>
  );
}
