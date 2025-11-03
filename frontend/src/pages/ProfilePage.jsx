import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderSidebarLayout from '../components/HeaderSidebarLayout';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase-config';
import { uploadImage } from '../services/cloudinary';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const dropdownRef = useRef(null);
  const menuButtonRef = useRef(null);
  const modalContentRef = useRef(null);
  
  // Dynamic user data with placeholder values
  const [userData, setUserData] = useState({
    name: user?.displayName || user?.email?.split('@')[0] || 'user_name',
    posts: 0,
    followers: 0,
    following: 0,
    bio: "Add bio",
    profileImage: user?.photoURL || null,
    hasProfileImage: !!user?.photoURL
  });

  const [activeTab, setActiveTab] = useState('own-recipes');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Edit modal state
  const [editName, setEditName] = useState(userData.name);
  const [editBio, setEditBio] = useState(userData.bio);
  const [editProfileImage, setEditProfileImage] = useState(userData.profileImage);

  // Update state when user changes
  useEffect(() => {
    if (user) {
      setUserData(prev => ({
        ...prev,
        name: user.displayName || user.email?.split('@')[0] || 'user_name',
        profileImage: user.photoURL || prev.profileImage,
        hasProfileImage: !!user.photoURL || prev.hasProfileImage
      }));
      setEditName(user.displayName || user.email?.split('@')[0] || 'user_name');
      setEditProfileImage(user.photoURL || userData.profileImage);
    }
  }, [user]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleImageClick = (imageType) => {
    console.log(`${imageType} clicked`);
    // Future functionality for image interactions
  };

  const handleProfileImageUpload = async (file = null) => {
    if (!file) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
          handleProfileImageUpload(selectedFile);
        }
      };
      input.click();
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadImage(file);
      const imageUrl = result.secure_url || result.url;
      
      // Update the edit modal state (don't update main profile until Save is clicked)
      setEditProfileImage(imageUrl);
      
      console.log('Profile image selected:', imageUrl);
    } catch (error) {
      console.error('Error uploading profile image:', error);
      alert('Failed to upload profile image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditProfile = () => {
    setEditName(userData.name);
    setEditBio(userData.bio);
    setEditProfileImage(userData.profileImage);
    setIsEditModalOpen(true);
  };

  const handleSaveEditProfile = async () => {
    try {
      setIsUploading(true);
      
      // Prepare update object for Firebase
      const updates = {};
      if (editName !== userData.name) {
        updates.displayName = editName;
      }
      if (editProfileImage !== userData.profileImage && editProfileImage) {
        updates.photoURL = editProfileImage;
      }

      // Update Firebase profile if there are changes
      if (auth.currentUser && Object.keys(updates).length > 0) {
        await updateProfile(auth.currentUser, updates);
      }

      // Update local state
      setUserData(prev => ({
        ...prev,
        name: editName,
        bio: editBio,
        profileImage: editProfileImage,
        hasProfileImage: !!editProfileImage
      }));

      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelEditProfile = () => {
    setEditName(userData.name);
    setEditBio(userData.bio);
    setEditProfileImage(userData.profileImage);
    setIsEditModalOpen(false);
  };

  const handleViewActivityLogs = () => {
    console.log('View Activity Logs clicked');
    setIsMenuOpen(false);
    // Future functionality for activity logs
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
                {/* Instagram-style Profile Section */}
                <div className="self-stretch flex flex-row justify-start items-start gap-14 flex-wrap">
                  {/* Profile Picture */}
                  <div className="relative">
                    <div className="w-40 h-40 relative">
                      {userData.hasProfileImage ? (
                        <img 
                          className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg cursor-pointer hover:opacity-90 transition-opacity" 
                          src={userData.profileImage} 
                          alt="Profile Avatar" 
                        />
                      ) : (
                        <div 
                          className="w-40 h-40 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-gray-500 text-4xl cursor-pointer hover:bg-gray-300 transition-all duration-200 shadow-lg"
                        >
                          {userData.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {/* Edit overlay icon - opens Edit Profile modal */}
                      <div 
                        className="absolute bottom-0 right-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors shadow-lg border-2 border-white"
                        onClick={handleEditProfile}
                        title="Edit profile"
                      >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Profile Info Section */}
                  <div className="flex-1 flex flex-col justify-start items-start gap-4">
                    {/* Username and Edit/Menu */}
                    <div className="w-full flex items-center gap-4">
                      <h1 className="text-2xl font-semibold font-['Poppins'] text-black">
                        {userData.name}
                      </h1>
                      <button
                        onClick={handleEditProfile}
                        className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium rounded-lg transition-colors duration-200"
                      >
                        Edit Profile
                      </button>
                      {/* Three-dot menu */}
                      <div className="relative">
                        <button
                          ref={menuButtonRef}
                          onClick={() => setIsMenuOpen(!isMenuOpen)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                          aria-label="More options"
                        >
                          <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="5" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="12" cy="19" r="2" />
                          </svg>
                        </button>
                        {isMenuOpen && (
                          <div
                            ref={dropdownRef}
                            className="absolute top-10 right-0 w-56 bg-white rounded-xl shadow-lg overflow-hidden z-50"
                            style={{
                              boxShadow: '5px 5px 4px 0px rgba(0,0,0,0.25)',
                            }}
                          >
                            <button
                              onClick={handleViewActivityLogs}
                              className="w-full h-14 p-2.5 flex items-center justify-center gap-2.5 bg-white hover:bg-gray-100 transition-colors duration-150"
                            >
                              <div className="text-black text-xl font-medium font-['Inter'] leading-5">
                                View Activity Logs
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats Section - Instagram style */}
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-1">
                        <span className="text-black text-lg font-semibold font-['Sarabun']">{userData.posts}</span>
                        <span className="text-black text-lg font-normal font-['Afacad']">posts</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-black text-lg font-semibold font-['Sarabun']">{userData.followers}</span>
                        <span className="text-black text-lg font-normal font-['Afacad']">followers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-black text-lg font-semibold font-['Sarabun']">{userData.following}</span>
                        <span className="text-black text-lg font-normal font-['Afacad']">following</span>
                      </div>
                    </div>

                    {/* Bio Section */}
                    <div className="w-full">
                      <div className="text-black text-base font-normal font-['Playfair_Display']">
                        {userData.bio === "Add bio" ? (
                          <span className="text-gray-500 italic">No bio yet. Click "Edit Profile" to add one.</span>
                        ) : (
                          userData.bio
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-orange-700"></div>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="self-stretch px-9 inline-flex justify-start items-center gap-28 flex-wrap content-center border-b border-gray-200">
              <button
                onClick={() => setActiveTab('own-recipes')}
                className={`pb-3 px-1 relative ${activeTab === 'own-recipes' ? 'border-b-2 border-orange-700' : ''}`}
              >
                <div className={`text-center text-lg font-normal font-['Poppins'] ${
                  activeTab === 'own-recipes' ? 'text-orange-700 font-semibold' : 'text-black'
                }`}>Own Recipes</div>
              </button>
              <button
                onClick={() => setActiveTab('liked-recipes')}
                className={`pb-3 px-1 relative ${activeTab === 'liked-recipes' ? 'border-b-2 border-orange-700' : ''}`}
              >
                <div className={`text-center text-lg font-normal font-['Poppins'] ${
                  activeTab === 'liked-recipes' ? 'text-orange-700 font-semibold' : 'text-black'
                }`}>Liked Recipes</div>
              </button>
              <button
                onClick={() => setActiveTab('saved-recipes')}
                className={`pb-3 px-1 relative ${activeTab === 'saved-recipes' ? 'border-b-2 border-orange-700' : ''}`}
              >
                <div className={`text-center text-lg font-normal font-['Poppins'] ${
                  activeTab === 'saved-recipes' ? 'text-orange-700 font-semibold' : 'text-black'
                }`}>Saved Recipes</div>
              </button>
            </div>
          </div>

          {/* Recipes Grid */}
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

        {/* Edit Profile Modal */}
        {isEditModalOpen && (
          <div 
            className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-[100]"
            onClick={handleCancelEditProfile}
          >
            <div 
              ref={modalContentRef}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-black">Edit Profile</h2>
                <button
                  onClick={handleCancelEditProfile}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Profile Picture Edit */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    {editProfileImage ? (
                      <img 
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                        src={editProfileImage} 
                        alt="Profile Avatar" 
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full border-4 border-gray-200 bg-gray-200 flex items-center justify-center text-gray-500 text-3xl">
                        {editName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <button
                      onClick={() => handleProfileImageUpload()}
                      className="absolute bottom-0 right-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors shadow-lg border-2 border-white"
                      disabled={isUploading}
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                  {isUploading && (
                    <p className="text-sm text-gray-500">Uploading...</p>
                  )}
                </div>

                {/* Display Name Edit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Bio Edit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-orange-500"
                    rows={4}
                    placeholder="Tell us about yourself"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={handleCancelEditProfile}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditProfile}
                  disabled={isUploading}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </HeaderSidebarLayout>
  );
}
