import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderSidebarLayout from '../components/HeaderSidebarLayout';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Dynamic user data with placeholder values
  const [userData, setUserData] = useState({
    name: user?.displayName || user?.email || 'user_name',
    posts: 0,
    followers: 0,
    following: 0,
    bio: "Add bio",
    profileImage: null,
    hasProfileImage: false
  });

  const [activeTab, setActiveTab] = useState('own-recipes');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(userData.bio);

  const handleImageClick = (imageType) => {
    console.log(`${imageType} clicked`);
    // Future functionality for image interactions
  };

  const handleProfileImageUpload = () => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Create a preview URL for the selected image
        const imageUrl = URL.createObjectURL(file);
        setUserData(prev => ({
          ...prev,
          profileImage: imageUrl,
          hasProfileImage: true
        }));
        console.log('Profile image uploaded:', file.name);
      }
    };
    input.click();
  };

  const handleBioClick = () => {
    setIsEditingBio(true);
  };

  const handleBioSave = () => {
    setUserData(prev => ({
      ...prev,
      bio: bioText
    }));
    setIsEditingBio(false);
  };

  const handleBioCancel = () => {
    setBioText(userData.bio);
    setIsEditingBio(false);
  };

  return (
    <HeaderSidebarLayout>
      <div className="w-full bg-stone-100 min-h-screen">
        {/* Back to Home Button */}
        <div className="px-7 py-4">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-orange-700 hover:text-orange-800 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
        </div>

        <div className="flex-1 px-7 pt-24 pb-2.5 flex flex-col justify-start items-center gap-12">
          <div className="self-stretch flex flex-col justify-start items-start gap-6">
            <div className="self-stretch flex flex-col justify-start items-end gap-6">
              <div className="self-stretch px-9 flex flex-col justify-start items-start gap-10">
                <div className="self-stretch inline-flex justify-start items-center gap-14 flex-wrap content-center">
                  <div className="w-52 h-52 relative">
                    {userData.hasProfileImage ? (
                      <img 
                        className="w-52 h-52 left-0 top-0 absolute rounded-full cursor-pointer hover:opacity-90 transition-opacity" 
                        src={userData.profileImage} 
                        alt="Profile Avatar" 
                        onClick={handleProfileImageUpload}
                      />
                    ) : (
                      <div 
                        className="w-52 h-52 left-0 top-0 absolute rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500 text-6xl cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all duration-200"
                        onClick={handleProfileImageUpload}
                      >
                        +
                      </div>
                    )}
                  </div>
                  <div className="w-[565px] inline-flex flex-col justify-start items-start gap-7">
                    <div className="self-stretch flex flex-col justify-start items-start gap-7">
                      <div className="self-stretch justify-center text-black text-2xl font-semibold font-['Poppins']">{userData.name}</div>
                      <div className="self-stretch inline-flex justify-start items-center gap-12">
                        <div className="flex justify-start items-center gap-3.5">
                          <div className="text-center justify-start text-black text-xl font-semibold font-['Sarabun']">{userData.posts}</div>
                          <div className="text-center justify-center text-black text-xl font-normal font-['Afacad']">posts</div>
                        </div>
                        <div className="flex justify-start items-center gap-5">
                          <div className="text-center justify-start text-black text-xl font-semibold font-['Sarabun']">{userData.followers}</div>
                          <div className="text-center justify-center text-black text-xl font-normal font-['Afacad']">followers</div>
                        </div>
                        <div className="flex justify-start items-center gap-4">
                          <div className="text-center justify-start text-black text-xl font-semibold font-['Sarabun']">{userData.following}</div>
                          <div className="text-center justify-center text-black text-xl font-normal font-['Afacad']">following</div>
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch justify-center text-black text-lg font-normal font-['Playfair_Display'] cursor-pointer hover:text-orange-700 transition-colors duration-200" onClick={handleBioClick}>
                      {isEditingBio ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={bioText}
                            onChange={(e) => setBioText(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-orange-500"
                            rows={2}
                            placeholder="Add bio"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleBioSave}
                              className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleBioCancel}
                              className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        `"${userData.bio}"`
                      )}
                    </div>
                  </div>
                </div>
                <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-orange-700"></div>
              </div>
            </div>
            <div className="self-stretch px-9 inline-flex justify-start items-center gap-28 flex-wrap content-center">
              <button
                onClick={() => setActiveTab('own-recipes')}
                className={`w-40 h-9 relative ${activeTab === 'own-recipes' ? 'border-b border-orange-700 overflow-hidden' : ''}`}
              >
                <div className={`left-0 top-0 absolute text-center justify-start text-lg font-normal font-['Poppins'] ${
                  activeTab === 'own-recipes' ? 'text-orange-700' : 'text-black'
                }`}>Own Recipes</div>
              </button>
              <button
                onClick={() => setActiveTab('liked-recipes')}
                className={`w-40 h-9 relative ${activeTab === 'liked-recipes' ? 'border-b border-orange-700 overflow-hidden' : ''}`}
              >
                <div className={`left-[-3px] top-0 absolute text-center justify-start text-lg font-normal font-['Poppins'] ${
                  activeTab === 'liked-recipes' ? 'text-orange-700' : 'text-black'
                }`}>Liked Recipes</div>
              </button>
              <button
                onClick={() => setActiveTab('saved-recipes')}
                className={`w-40 h-9 relative ${activeTab === 'saved-recipes' ? 'border-b border-orange-700 overflow-hidden' : ''}`}
              >
                <div className={`left-[-10px] top-0 absolute text-center justify-start text-lg font-normal font-['Poppins'] ${
                  activeTab === 'saved-recipes' ? 'text-orange-700' : 'text-black'
                }`}>Saved Recipes</div>
              </button>
            </div>
          </div>
          <div className="self-stretch px-14 flex justify-center items-center">
            {userData.posts === 0 ? (
              <div className="text-center text-gray-600 text-lg py-20">
                No posts yet. Start sharing your first recipe!
              </div>
            ) : (
              <div className="inline-flex justify-start items-center gap-20 flex-wrap content-center">
                <div className="w-80 h-80 relative">
                  <img 
                    className="w-96 h-[495px] left-[-16px] top-0 absolute rounded-[30px] cursor-pointer hover:opacity-90 transition-opacity" 
                    src="https://placehold.co/387x495" 
                    alt="Recipe 1" 
                    onClick={() => handleImageClick('recipe-1')}
                  />
                </div>
                <div className="w-80 h-80 relative">
                  <img 
                    className="w-96 h-[495px] left-[-16px] top-0 absolute rounded-[30px] cursor-pointer hover:opacity-90 transition-opacity" 
                    src="https://placehold.co/387x495" 
                    alt="Recipe 2" 
                    onClick={() => handleImageClick('recipe-2')}
                  />
                </div>
                <div className="w-80 h-80 relative">
                  <img 
                    className="w-96 h-[495px] left-[-16px] top-0 absolute rounded-[30px] cursor-pointer hover:opacity-90 transition-opacity" 
                    src="https://placehold.co/387x495" 
                    alt="Recipe 3" 
                    onClick={() => handleImageClick('recipe-3')}
                  />
                </div>
                <div className="w-80 h-80 relative">
                  <img 
                    className="w-96 h-[495px] left-[-16px] top-0 absolute rounded-[30px] cursor-pointer hover:opacity-90 transition-opacity" 
                    src="https://placehold.co/387x495" 
                    alt="Recipe 4" 
                    onClick={() => handleImageClick('recipe-4')}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </HeaderSidebarLayout>
  );
}