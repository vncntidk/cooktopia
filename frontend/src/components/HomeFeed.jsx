import React, { useEffect, useState } from "react";
import styles from "./Component.module.css";
import { db } from "../config/firebase-config";
import { collection, onSnapshot } from "firebase/firestore";
import { Bookmark } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import ViewPostModal from "../modals/ViewPostModal";
import { getRecipeById } from "../services/recipes";
import Avatar from "./Avatar";
import {
  getRecipeInteractionCounts,
  toggleRecipeLike,
  hasUserLikedRecipe,
  toggleRecipeSave,
  hasUserSavedRecipe,
} from "../services/interactions";

export default function HomeFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [interactionData, setInteractionData] = useState({}); // { recipeId: { likes, comments, saves, isLiked, isSaved } }
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load interaction data for all recipes
  useEffect(() => {
    if (posts.length === 0) return;

    const loadInteractions = async () => {
      const interactionPromises = posts.map(async (post) => {
        const counts = await getRecipeInteractionCounts(post.id);
        let isLiked = false;
        let isSaved = false;

        if (user?.uid) {
          [isLiked, isSaved] = await Promise.all([
            hasUserLikedRecipe(post.id, user.uid),
            hasUserSavedRecipe(post.id, user.uid),
          ]);
        }

        return {
          id: post.id,
          ...counts,
          isLiked,
          isSaved,
        };
      });

      const interactions = await Promise.all(interactionPromises);
      const interactionMap = {};
      interactions.forEach((interaction) => {
        interactionMap[interaction.id] = interaction;
      });
      setInteractionData(interactionMap);
    };

    loadInteractions();
  }, [posts, user]);

  const handleToggleLike = async (recipeId, e) => {
    e.stopPropagation();
    if (!user?.uid) return;

    try {
      const newLikedState = await toggleRecipeLike(recipeId, user.uid);
      const counts = await getRecipeInteractionCounts(recipeId);
      
      setInteractionData((prev) => ({
        ...prev,
        [recipeId]: {
          ...prev[recipeId],
          likes: counts.likes,
          isLiked: newLikedState,
        },
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleToggleSave = async (recipeId, e) => {
    e.stopPropagation();
    if (!user?.uid) return;

    try {
      const newSavedState = await toggleRecipeSave(recipeId, user.uid);
      const counts = await getRecipeInteractionCounts(recipeId);
      
      setInteractionData((prev) => ({
        ...prev,
        [recipeId]: {
          ...prev[recipeId],
          saves: counts.saves,
          isSaved: newSavedState,
        },
      }));
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const handleProfileClick = (authorId, e) => {
    e.stopPropagation();
    if (authorId) {
      navigate(`/profile/${authorId}`);
    }
  };

  // Fetch recipes from Firestore in real-time with Dynamic Listener :)
  useEffect(() => {
    const recipesCol = collection(db, "recipes");
    const unsubscribe = onSnapshot(
      recipesCol,
      (snap) => {
        try {
            const fetched = snap.docs.map((doc) => {
            const data = doc.data() || {};
            const imageFromFirestore =
              Array.isArray(data.imageUrls) && data.imageUrls.length > 0
                ? data.imageUrls[0]
                : null;

            return {
              id: doc.id,
              img: imageFromFirestore || "/posts/placeholder.jpg",
              user: data.authorName || "user_name",
              authorId: data.authorId || null,
              title: data.title || null,
            };
          });

          setPosts(fetched);
        } catch (err) {
          console.error("Error processing recipes snapshot:", err);
        }
      },
      (err) => {
        console.error("Error listening to recipes collection:", err);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle opening post from notification (via location state)
  useEffect(() => {
    const openRecipeId = location.state?.openRecipeId;
    if (openRecipeId && !isModalOpen) {
      // Find the post in the current posts list
      const post = posts.find(p => p.id === openRecipeId);
      if (post) {
        setSelectedRecipe(post);
        setIsModalOpen(true);
        // Clear the state to prevent reopening on re-render
        navigate(location.pathname, { replace: true, state: {} });
      } else {
        // If post not in list yet, fetch it directly
        getRecipeById(openRecipeId).then((recipe) => {
          if (recipe) {
            setSelectedRecipe({
              id: recipe.id,
              img: recipe.imageUrls?.[0] || "/posts/placeholder.jpg",
              user: recipe.authorName || "user_name",
              authorId: recipe.authorId || null,
              title: recipe.title || null,
            });
            setIsModalOpen(true);
            // Clear the state
            navigate(location.pathname, { replace: true, state: {} });
          }
        }).catch(() => {
          // Silent fail
        });
      }
    }
  }, [location.state, posts, isModalOpen, navigate, location.pathname]);

  return (
    <main className={`${styles.contentWrapper} px-4 w-24/25 flex justify-evenly`}>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-2 space-y-6 w-full max-w-[1350px]">
        {posts.map((post, idx) => (
          <article
            key={post.id}
            className={`${styles.recipeCards} break-inside-avoid group relative rounded-xl transition-all duration-300 overflow-hidden`}
            style={{ animationDelay: `${idx * 0.07}s` }}
          >
            <div className={`${styles.recipeCards} overflow-hidden rounded-xl`}>
              <img
                src={post.img}
                loading="lazy"
                className="w-full h-auto object-cover transform group-hover:scale-105 group-hover:brightness-60 transition-transform duration-500"
                alt="Food Post"
              />
            </div>

            {/* Save Icon - Only bookmark appears on hover (no count) */}
            <div className="absolute top-4 right-5 opacity-0 group-hover:opacity-100 transition z-20">
              <button
                onClick={(e) => handleToggleSave(post.id, e)}
                className="flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full w-10 h-10 shadow-md hover:bg-white transition"
                disabled={!user?.uid}
                aria-label={interactionData[post.id]?.isSaved ? 'Unsave recipe' : 'Save recipe'}
              >
                <Bookmark 
                  className={`w-5 h-5 ${interactionData[post.id]?.isSaved ? 'fill-orange-500 text-orange-500' : 'text-gray-700'}`} 
                />
              </button>
            </div>

            {/* VIEW RECIPE BUTTON */}
            <button
              onClick={() => {
                setSelectedRecipe(post);
                setIsModalOpen(true);
              }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 w-10/13 shadow-md h-8 text-sm font-medium bg-white rounded-md opacity-0 group-hover:opacity-100 transition
                    group-hover:translate-y-0 translate-y-2 hover:shadow-md hover:rounded-md hover:bg-[#FE982A] hover:text-white duration-300 z-10"
            >
              View Recipe
            </button>

            {/* Username tag - clickable */}
            <button
              onClick={(e) => {
                // Extract authorId from post data if available
                const authorId = post.authorId;
                if (authorId) {
                  handleProfileClick(authorId, e);
                }
              }}
              className="p-6 flex items-center gap-2 text-gray-700 text-sm bg-white/50 backdrop-blur-sm hover:bg-white/70 transition w-full text-left"
            >
              <Avatar
                userId={post.authorId}
                displayName={post.user}
                size="sm"
              />
              <span>@{post.user}</span>
            </button>
          </article>
        ))}
      </div>

      {/* View Recipe Modal */}
      {isModalOpen && selectedRecipe && (
        <ViewPostModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRecipe(null);
          }}
          recipe={selectedRecipe}
        />
      )}
    </main>
  );
}