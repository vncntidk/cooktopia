import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import HeaderSidebarLayout from "../components/HeaderSidebarLayout";
import { Bookmark } from "lucide-react";
import styles from "../components/Component.module.css";
import ViewPostModal from "../modals/ViewPostModal";
import { useAuth } from "../contexts/AuthContext";

// Mock Data
const MOCK_RECIPES = [
  {
    id: "1",
    title: "Vegan Chili Oil Wonton Recipe",
    img: "/posts/1.jpg",
    user: "chef_maria",
    authorId: "user1",
    ingredients: ["egg", "wonton", "chili oil", "soy sauce"],
    rating: 4.5,
    saves: 234,
  },
  {
    id: "2",
    title: "Classic Scrambled Eggs",
    img: "/posts/2.jpg",
    user: "eggmaster123",
    authorId: "user2",
    ingredients: ["egg", "butter", "salt", "pepper"],
    rating: 5.0,
    saves: 567,
  },
  {
    id: "3",
    title: "Egg Fried Rice",
    img: "/posts/3.jpg",
    user: "asian_cuisine",
    authorId: "user3",
    ingredients: ["egg", "rice", "soy sauce", "vegetables"],
    rating: 4.8,
    saves: 432,
  },
  {
    id: "4",
    title: "Simple Egg Salad",
    img: "/posts/4.jpg",
    user: "healthy_eats",
    authorId: "user4",
    ingredients: ["egg", "mayo", "celery", "mustard"],
    rating: 4.2,
    saves: 189,
  },
  {
    id: "5",
    title: "Fluffy Omelet",
    img: "/posts/5.jpg",
    user: "breakfast_pro",
    authorId: "user5",
    ingredients: ["egg", "cheese", "milk", "herbs"],
    rating: 4.7,
    saves: 345,
  },
  {
    id: "6",
    title: "Egg Benedict",
    img: "/posts/6.jpg",
    user: "gourmet_chef",
    authorId: "user6",
    ingredients: ["egg", "english muffin", "hollandaise", "ham"],
    rating: 4.9,
    saves: 678,
  },
  {
    id: "7",
    title: "Pure Egg Dish",
    img: "/posts/7.jpg",
    user: "simple_cook",
    authorId: "user7",
    ingredients: ["egg"],
    rating: 3.8,
    saves: 89,
  },
  {
    id: "8",
    title: "Deviled Eggs",
    img: "/posts/8.jpg",
    user: "party_foods",
    authorId: "user8",
    ingredients: ["egg", "mayo", "paprika", "mustard"],
    rating: 4.6,
    saves: 321,
  },
];

const MOCK_USERS = [
  {
    id: "user1",
    username: "eggmaster123",
    profilePic: "/profile.png",
    followers: 1250,
    following: 340,
  },
  {
    id: "user2",
    username: "chefeggbert",
    profilePic: "/profile.png",
    followers: 890,
    following: 215,
  },
  {
    id: "user3",
    username: "egglover99",
    profilePic: "/profile.png",
    followers: 2340,
    following: 567,
  },
  {
    id: "user4",
    username: "breakfast_egg",
    profilePic: "/profile.png",
    followers: 567,
    following: 123,
  },
  {
    id: "user5",
    username: "egg_recipes_daily",
    profilePic: "/profile.png",
    followers: 4567,
    following: 890,
  },
  {
    id: "user6",
    username: "scrambledeggs",
    profilePic: "/profile.png",
    followers: 1890,
    following: 456,
  },
];

// User Card Component
function UserCard({ user }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();

  const handleFollowToggle = (e) => {
    e.stopPropagation();
    setIsFollowing(!isFollowing);
  };

  const handleCardClick = () => {
    navigate(`/profile/${user.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="w-56 h-52 relative cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
      style={{ padding: '6px' }}
    >
      <div className="w-full h-full bg-white rounded-lg shadow-lg flex flex-col items-center justify-center"
        style={{ paddingLeft: '12px', paddingRight: '12px', paddingTop: '15px', paddingBottom: '15px' }}
      >
        {/* Profile Picture */}
        <img
          src={user.profilePic}
          alt={user.username}
          className="w-16 h-16 rounded-full object-cover shadow-md mb-2"
        />
        
        {/* Username */}
        <h3 className="text-lg font-bold text-black mb-1">
          @{user.username}
        </h3>
        
        {/* Followers Info */}
        <p className="text-xs text-gray-600" style={{ paddingBottom: '8px' }}>
          {user.followers} followers • {user.following} following
        </p>
        
        {/* Follow Button */}
        <button
          onClick={handleFollowToggle}
          className={`rounded-full shadow-md font-medium text-xs transition-all duration-300 ${
            isFollowing
              ? "bg-gray-300 text-gray-700 hover:bg-gray-400"
              : "bg-orange-400 text-white hover:bg-orange-500 hover:shadow-lg"
          }`}
          style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '2px', paddingBottom: '2px' }}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
                    </div>
                </div>
  );
}

// Recipe Card Component (matching HomePage style)
function RecipeCard({ recipe }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleToggleSave = (e) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
    navigate(`/profile/${recipe.authorId}`);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <div key={i} className="w-5 h-5 text-orange-400 fill-current">
          ★
        </div>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="w-5 h-5 text-orange-400">
          ☆
        </div>
      );
    }

    return stars;
  };

  return (
    <>
      <article
        className={`${styles.recipeCards} break-inside-avoid group relative rounded-xl transition-all duration-300 overflow-hidden cursor-pointer`}
        style={{ padding: '8px' }}
      >
        <div className="overflow-hidden rounded-xl relative">
          <img
            src={recipe.img}
            loading="lazy"
            className="w-full h-auto object-cover transform group-hover:scale-105 group-hover:brightness-60 transition-transform duration-500"
            alt={recipe.title}
          />
        </div>

        {/* Save Icon - appears on hover */}
        <div className="absolute top-4 right-5 opacity-0 group-hover:opacity-100 transition z-20">
          <button
            onClick={handleToggleSave}
            className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1.5 shadow-md hover:bg-white transition"
          >
            <Bookmark
              className={`w-5 h-5 ${
                isSaved ? "fill-orange-500 text-orange-500" : "text-gray-700"
              }`}
            />
            <span className="text-xs font-medium">{recipe.saves}</span>
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

        {/* Username tag - clickable */}
        <button
          onClick={handleProfileClick}
          className="p-6 flex items-center gap-2 text-gray-700 text-sm bg-white/50 backdrop-blur-sm hover:bg-white/70 transition w-full text-left"
        >
          <img src="/icons/profileMini.png" className="w-5 h-5" alt="Profile" />
          @{recipe.user}
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
  const [searchParams] = useSearchParams();
  const [filteredResults, setFilteredResults] = useState([]);
  const [resultType, setResultType] = useState("recipes"); // 'recipes' or 'users'

  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "recipe-title";

  useEffect(() => {
    if (!query) {
      setFilteredResults([]);
      return;
    }

    const searchTerm = query.toLowerCase();

    switch (type) {
      case "recipe-title":
        // Search in recipe titles
        const titleResults = MOCK_RECIPES.filter((recipe) =>
          recipe.title.toLowerCase().includes(searchTerm)
        );
        setFilteredResults(titleResults);
        setResultType("recipes");
        break;

      case "recipe-ingredient":
        // Recipes with search term as an ingredient
        const ingredientResults = MOCK_RECIPES.filter((recipe) =>
          recipe.ingredients.some((ing) =>
            ing.toLowerCase().includes(searchTerm)
          )
        );
        setFilteredResults(ingredientResults);
        setResultType("recipes");
        break;

      case "recipe-strict":
        // Recipes with ONLY this ingredient
        const strictResults = MOCK_RECIPES.filter(
          (recipe) =>
            recipe.ingredients.length === 1 &&
            recipe.ingredients[0].toLowerCase() === searchTerm
        );
        setFilteredResults(strictResults);
        setResultType("recipes");
        break;

      case "user-search":
        // Search in usernames
        const userResults = MOCK_USERS.filter((user) =>
          user.username.toLowerCase().includes(searchTerm)
        );
        setFilteredResults(userResults);
        setResultType("users");
        break;

      default:
        setFilteredResults([]);
        setResultType("recipes");
    }
  }, [query, type]);

  const getSearchTypeLabel = () => {
    switch (type) {
      case "recipe-title":
        return `Search results for "${query}" in recipe titles`;
      case "recipe-ingredient":
        return `Recipes with "${query}" as an ingredient`;
      case "recipe-strict":
        return `Recipes with ONLY "${query}"`;
      case "user-search":
        return `Users matching "${query}"`;
      default:
        return `Search results for "${query}"`;
    }
  };

  return (
    <HeaderSidebarLayout>
      <div className="w-full min-h-screen bg-stone-100" 
        style={{ paddingLeft: '30px', paddingRight: '30px', paddingTop: '70px', paddingBottom: '30px' }}
      >
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {getSearchTypeLabel()}
          </h1>
          <p className="text-gray-600">
            Found {filteredResults.length} result(s)
          </p>
        </div>

        {/* Results Grid */}
        {filteredResults.length > 0 ? (
          resultType === "recipes" ? (
            // Recipe Grid (matching HomePage masonry layout)
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-6"
              style={{ paddingLeft: '20px', paddingRight: '20px' }}
            >
              {filteredResults.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            // User Grid
            <div className="flex flex-wrap gap-1"
              style={{ paddingLeft: '20px', paddingRight: '20px' }}
            >
              {filteredResults.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )
        ) : (
          // No Results
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-2xl text-gray-500 mb-4">No results found</p>
            <p className="text-gray-400">
              Try adjusting your search or search type
            </p>
                </div>
        )}
            </div>
    </HeaderSidebarLayout>
  );
}
