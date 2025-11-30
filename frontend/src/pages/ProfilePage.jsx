import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import HeaderSidebarLayout from '../components/HeaderSidebarLayout';
import Sidebar from '../components/Sidebar/Sidebar';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Own Recipes');

  const owned = [];
  const liked = [];
  const favorites = [];

  return (
    <HeaderSidebarLayout>
    <div className="profile-page bg-white shadow min-h-screen bg-gray-50 p-8 pt-24">

       <header className="flex items-center gap-6 p-6 border-b border-gray-200">
  {/* Profile Image */}
  <div className="flex-shrink-0">
    <img
      src="/profile.png"
      alt="Profile"
      className="w-28 h-28 rounded-full object-cover border border-gray-300"
    />
  </div>

  {/* User Info */}
  <div className="flex flex-col justify-center">
    {/* Username */}
    <h3 className="justify-center text-xl font-semibold text-gray-800 mb-2">
      {user?.displayName}
    </h3>

    {/* Stats */}
    <div className="flex justify-center gap-6 text-gray-600 mb-3">
      <span>{user?.post} Posts</span>
      <span>{user?.followers} Followers</span>
      <span>{user?.following} Following</span>
    </div>

    {/* Bio */}
    <p className="justify-center text-gray-700 italic max-w-md">
      “I'm a creep. I'm a weirdo...” {user?.Bio || ""}
    </p>
  </div>
</header>


      {/* tabs for the own, liked, and saved recipes
          in each click sa button is mag change ang content sa ubos */}
      <div className="tabs flex justify-center gap-8 border-b border-gray-300 pb-2">
  {['Own Recipes', 'Liked Recipes', 'Saved Recipes'].map((tab, i) => (
    <button
      key={i}
      className="relative pb-2 text-gray-600 hover:text-orange-500 transition-colors duration-200"
    >
      {tab}
      {/* underline bar */}
      <span className="absolute left-0 bottom-0 w-full h-0.5 bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
    </button>
  ))}
</div>


      {/* static list kay wala pa source */}
      <div className="RecipeList">
        {/* add recipe tabs here pero wala pa ta source of recipes*/}
      </div>

    </div>
    </HeaderSidebarLayout>
  );
}
