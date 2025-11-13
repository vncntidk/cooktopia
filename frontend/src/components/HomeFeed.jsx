import React, { useEffect, useState } from "react";
import styles from "./Component.module.css";
import { db } from "../config/firebase-config";
import { collection, onSnapshot } from "firebase/firestore";

export default function HomeFeed() {
  const [posts, setPosts] = useState([]);
  const [savedItems, setSavedItems] = useState({});
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleSave = (id) => {
    setSavedItems((prev) => ({ ...prev, [id]: !prev[id] }));
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

            {/* SAVE BUTTON */}
            <button
              onClick={() => toggleSave(post.id)}
              className="absolute top-4 right-5 opacity-0 group-hover:opacity-100 transition"
            >
              <img
                src={savedItems[post.id] ? "/icons/saveActive.png" : "/icons/saveIcon.png"}
                className="w-6 drop-shadow"
              />
            </button>

            {/* VIEW RECIPE BUTTON */}
            <button
              className="absolute bottom-10 left-1/2 -translate-x-1/2 w-10/13 shadow-md h-8 text-sm font-medium bg-white rounded-md opacity-0 group-hover:opacity-100 transition
                    group-hover:translate-y-0 translate-y-2 hover:shadow-md hover:rounded-md hover:bg-[#FE982A] hover:text-white duration-300"
            >
              View Recipe
            </button>

            {/* Username tag */}
            <div className="p-6 flex items-center gap-2 text-gray-700 text-sm bg-white/50 backdrop-blur-sm">
              <img src="/icons/profileMini.png" className="w-5 h-5" />
              @{post.user}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}