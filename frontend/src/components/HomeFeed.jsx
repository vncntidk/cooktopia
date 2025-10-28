import React, { useEffect, useState } from "react";
import styles from "./Component.module.css";

const initialPosts = [
  { id: 1, img: "/posts/1.jpg", user: "user_name" },
  { id: 2, img: "/posts/2.jpg", user: "user_name" },
  { id: 3, img: "/posts/3.jpg", user: "user_name" },
  { id: 4, img: "/posts/4.jpg", user: "user_name" },
  { id: 5, img: "/posts/5.jpg", user: "user_name" },
  { id: 6, img: "/posts/6.jpg", user: "user_name" },
  { id: 7, img: "/posts/7.jpg", user: "user_name" },
  { id: 8, img: "/posts/8.jpg", user: "user_name" },
];

export default function HomeFeed() {
  const [posts, setPosts] = useState(initialPosts);

  useEffect(() => {
    const scroller = document.querySelector(".scroll-container");
    if (!scroller) return;

    const handleScroll = () => {
      if (
        scroller.scrollTop + scroller.clientHeight >=
        scroller.scrollHeight - 300
      ) {
        const more = initialPosts.map(i => ({ ...i, id: Math.random() }));
        setPosts(prev => [...prev, ...more]);
      }
    };

    scroller.addEventListener("scroll", handleScroll);
    return () => scroller.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className={`${styles.contentWrapper} px-4 w-24/25 flex justify-evenly`}>
        <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6 w-full max-w-[1350px] mt-16">
            {posts.map((post, idx) => (
            <article
                key={post.id}
                className="break-inside-avoid group relative rounded-xl hover:shadow-xl transition-all duration-300 overflow-hidden"
                style={{ animationDelay: `${idx * 0.07}s` }}
            >
                <div className="overflow-hidden rounded-xl">
                <img
                    src={post.img}
                    loading="lazy"
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                    alt="Food Post"
                />
                </div>

                {/* Hover Action Buttons */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="bg-white/90 p-2 rounded-full shadow hover:scale-110">
                    <img src="/icons/heartIcon.png" className="w-4" />
                </button>
                <button className="bg-white/90 p-2 rounded-full shadow hover:scale-110">
                    <img src="/icons/saveIcon.png" className="w-4" />
                </button>
                </div>

                {/* Username tag below */}
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
