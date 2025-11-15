import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  updateProfile,
  updateEmail,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore';
import HeaderSidebarLayout from '../components/HeaderSidebarLayout';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../config/firebase-config';
import { uploadImage } from '../services/cloudinary';
import {
  getUserProfile,
  updateUserProfile,
  getUserRecipeCount,
  getUserFollowersCount,
  getUserFollowingCount,
} from '../services/users';
import { followUser, unfollowUser, isFollowing } from '../services/follows';
import ViewPostModal from '../modals/ViewPostModal';
import './ProfilePage.css';
import '../modals/EditProfileModal.css';

const SECTION_KEYS = {
  'own-recipes': {
    label: 'Own Recipes',
    emptyMessage: 'No recipes yet. Start sharing your first dish!',
    userCollection: null,
  },
  'liked-recipes': {
    label: 'Liked Recipes',
    emptyMessage: 'You haven’t liked any recipes yet. Explore the feed and tap the heart to save your faves.',
    userCollection: 'likedRecipes',
  },
  'saved-recipes': {
    label: 'Saved Recipes',
    emptyMessage: 'Keep track of recipes you love by saving them from the feed.',
    userCollection: 'savedRecipes',
  },
};

const PAGE_SIZE = 6;

const initialSectionState = {
  items: [],
  loading: false,
  error: '',
  hasMore: true,
  cursor: null,
  initialised: false,
};

const initialFormErrors = {
  name: '',
  email: '',
  bio: '',
  upload: '',
};

function getInitialUserData(user) {
  const fallbackName = user?.displayName || user?.email?.split('@')[0] || 'user_name';

  return {
    name: fallbackName,
    email: user?.email || '',
    posts: 0,
    followers: 0,
    following: 0,
    bio: 'Add bio',
    profileImage: user?.photoURL || null,
    hasProfileImage: Boolean(user?.photoURL),
  };
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { userId: urlUserId } = useParams();
  const { user, reloadUser } = useAuth();
  
  // Determine if viewing own profile or another user's profile
  const profileUserId = urlUserId || user?.uid;
  const isOwnProfile = !urlUserId || urlUserId === user?.uid;

  // Initialize with empty state when viewing another user to prevent flash of wrong data
  const [userData, setUserData] = useState(() => {
    // Only use current user's data if viewing own profile
    if (!urlUserId || urlUserId === user?.uid) {
      return getInitialUserData(user);
    }
    // Return empty/loading state for other users
    return {
      name: '',
      email: '',
      posts: 0,
      followers: 0,
      following: 0,
      bio: 'Add bio',
      profileImage: null,
      hasProfileImage: false,
    };
  });
  const [activeTab, setActiveTab] = useState('own-recipes');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sections, setSections] = useState(() => ({
    'own-recipes': { ...initialSectionState },
    'liked-recipes': { ...initialSectionState },
    'saved-recipes': { ...initialSectionState },
  }));

  const [formState, setFormState] = useState({
    name: userData.name,
    email: userData.email,
    bio: userData.bio === 'Add bio' ? '' : userData.bio,
    profileImage: userData.profileImage,
  });

  const [formErrors, setFormErrors] = useState(initialFormErrors);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle | uploading | success | error
  const [submissionStatus, setSubmissionStatus] = useState('idle'); // idle | saving | success | error
  const [submissionMessage, setSubmissionMessage] = useState('');

  const dropdownRef = useRef(null);
  const menuButtonRef = useRef(null);
  const sectionsRef = useRef(sections);

  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  // Load user profile data and stats from Firestore
  // Reset userData when profileUserId changes to prevent showing wrong user's data
  useEffect(() => {
    if (!profileUserId) {
      return;
    }

    // Reset to loading state when switching users
    if (!isOwnProfile) {
      setUserData({
        name: '',
        email: '',
        posts: 0,
        followers: 0,
        following: 0,
        bio: 'Add bio',
        profileImage: null,
        hasProfileImage: false,
      });
    }

    const loadUserData = async () => {
      try {
        // Load profile data from Firestore
        const profileData = await getUserProfile(profileUserId);
        
        // Load stats
        const [postsCount, followersCount, followingCount] = await Promise.all([
          getUserRecipeCount(profileUserId),
          getUserFollowersCount(profileUserId),
          getUserFollowingCount(profileUserId),
        ]);

        // Get username: for own profile use Firebase Auth, for others use Firestore
        // Firestore should have displayName saved from profile updates
        let userName = 'user_name';
        if (isOwnProfile) {
          userName = user.displayName || user.email?.split('@')[0] || 'user_name';
        } else {
          // For other users, try Firestore displayName first, then check recipes for authorName
          userName = profileData.displayName || profileData.name;
          
          // If still no name, try to get it from their most recent recipe
          if (!userName || userName === 'user_name') {
            try {
              const recipesRef = collection(db, 'recipes');
              const userRecipesQuery = query(
                recipesRef,
                where('authorId', '==', profileUserId),
                where('isPublished', '==', true),
                orderBy('createdAt', 'desc'),
                limit(1)
              );
              const recipeSnapshot = await getDocs(userRecipesQuery);
              if (!recipeSnapshot.empty) {
                const latestRecipe = recipeSnapshot.docs[0].data();
                userName = latestRecipe.authorName || userName;
              }
            } catch (error) {
              console.error('Error fetching username from recipes:', error);
            }
          }
          
          // Final fallback
          if (!userName || userName === 'user_name') {
            userName = `user_${profileUserId.slice(0, 8)}`;
          }
        }

        const freshData = {
          name: userName,
          email: isOwnProfile 
            ? (user.email || '')
            : (profileData.email || ''),
          posts: postsCount,
          followers: followersCount,
          following: followingCount,
          bio: profileData.bio || 'Add bio',
          profileImage: isOwnProfile
            ? (user.photoURL || profileData.profileImage || null)
            : (profileData.profileImage || null),
          hasProfileImage: Boolean(
            isOwnProfile 
              ? (user.photoURL || profileData.profileImage)
              : profileData.profileImage
          ),
        };

        setUserData((prev) => ({
          ...prev,
          ...freshData,
        }));

        if (isOwnProfile) {
          setFormState({
            name: freshData.name,
            email: freshData.email,
            bio: freshData.bio === 'Add bio' ? '' : freshData.bio,
            profileImage: freshData.profileImage,
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Fallback to basic user data
        const fallbackData = isOwnProfile 
          ? getInitialUserData(user)
          : getInitialUserData(null);
        setUserData((prev) => ({
          ...prev,
          ...fallbackData,
        }));
      }
    };

    loadUserData();
  }, [profileUserId, user, isOwnProfile]);

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

  useEffect(() => {
    if (!isEditModalOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsEditModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isEditModalOpen]);

  const handleProfileImageUpload = useCallback(async (file = null) => {
    if (!file) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
          handleProfileImageUpload(selectedFile);
        }
      };
      input.click();
      return;
    }

    setUploadStatus('uploading');
    setFormErrors((prev) => ({ ...prev, upload: '' }));

    try {
      const result = await uploadImage(file);
      const imageUrl = result.secure_url || result.url;
      setFormState((prev) => ({
        ...prev,
        profileImage: imageUrl,
      }));
      setUploadStatus('success');
      setSubmissionMessage('Image uploaded! Remember to hit Save.');
    } catch (error) {
      console.error('Error uploading profile image:', error);
      setUploadStatus('error');
      setFormErrors((prev) => ({
        ...prev,
        upload: 'Failed to upload profile photo. Please try again.',
      }));
    }
  }, []);

  const validateForm = useCallback(() => {
    const errors = { ...initialFormErrors };
    let isValid = true;

    if (!formState.name.trim()) {
      errors.name = 'Display name is required.';
      isValid = false;
    } else if (formState.name.trim().length < 2) {
      errors.name = 'Display name must be at least 2 characters.';
      isValid = false;
    }

    if (!formState.email.trim()) {
      errors.email = 'Email is required.';
      isValid = false;
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formState.email.trim())) {
        errors.email = 'Enter a valid email address.';
        isValid = false;
      }
    }

    if (formState.bio && formState.bio.length > 280) {
      errors.bio = 'Bio must be 280 characters or fewer.';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  }, [formState]);

  const resetModalState = useCallback(() => {
    setFormState({
      name: userData.name,
      email: userData.email,
      bio: userData.bio === 'Add bio' ? '' : userData.bio,
      profileImage: userData.profileImage,
    });
    setFormErrors(initialFormErrors);
    setUploadStatus('idle');
    setSubmissionStatus('idle');
    setSubmissionMessage('');
  }, [userData]);

  const handleEditProfileOpen = useCallback(() => {
    resetModalState();
    setIsEditModalOpen(true);
  }, [resetModalState]);

  const handleEditProfileClose = useCallback(() => {
    setIsEditModalOpen(false);
    resetModalState();
  }, [resetModalState]);

  const fetchRecipesBySection = useCallback(
    async (sectionKey, reset = false) => {
      if (!profileUserId) {
        return;
      }

      const currentState = sectionsRef.current[sectionKey];
      if (currentState.loading) {
        return;
      }

      const cursor = reset ? null : currentState.cursor;

      setSections((prev) => ({
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          loading: true,
          error: '',
          ...(reset
            ? {
                items: [],
                cursor: null,
                hasMore: true,
              }
            : {}),
        },
      }));

      try {
        let fetchedRecipes = [];
        let lastVisible = null;
        let hasMore = true;

        if (sectionKey === 'own-recipes') {
          const recipesRef = collection(db, 'recipes');
          const conditions = [
            where('authorId', '==', profileUserId),
            where('isPublished', '==', true),
            orderBy('createdAt', 'desc'),
            limit(PAGE_SIZE),
          ];
          if (cursor) {
            conditions.push(startAfter(cursor));
          }

          const snapshot = await getDocs(query(recipesRef, ...conditions));

          fetchedRecipes = snapshot.docs.map((docSnapshot) => ({
            id: docSnapshot.id,
            ...docSnapshot.data(),
          }));

          lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
          hasMore = fetchedRecipes.length === PAGE_SIZE;
        } else {
          // Only show liked/saved recipes for own profile
          if (!isOwnProfile) {
            setSections((prev) => ({
              ...prev,
              [sectionKey]: {
                ...prev[sectionKey],
                loading: false,
                error: '',
                items: [],
                hasMore: false,
                initialised: true,
              },
            }));
            return;
          }

          const { userCollection } = SECTION_KEYS[sectionKey];
          const subCollectionRef = collection(db, 'users', profileUserId, userCollection);
          const constraints = [orderBy('createdAt', 'desc'), limit(PAGE_SIZE)];
          if (cursor) {
            constraints.push(startAfter(cursor));
          }

          const snapshot = await getDocs(query(subCollectionRef, ...constraints));
          const recipeIds = snapshot.docs
            .map((docSnapshot) => ({
              id: docSnapshot.id,
              recipeId: docSnapshot.data()?.recipeId || docSnapshot.id,
              createdAt: docSnapshot.data()?.createdAt || null,
            }))
            .filter((entry) => Boolean(entry.recipeId));

          const recipePromises = recipeIds.map(async (entry) => {
            const recipeDoc = await getDoc(doc(db, 'recipes', entry.recipeId));
            if (recipeDoc.exists()) {
              return {
                id: recipeDoc.id,
                ...recipeDoc.data(),
                bookmarkedAt: entry.createdAt,
              };
            }
            return null;
          });

          fetchedRecipes = (await Promise.all(recipePromises)).filter(Boolean);
          lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
          hasMore = snapshot.size === PAGE_SIZE;
        }

        setSections((prev) => {
          const mergedItems = reset
            ? fetchedRecipes
            : [...prev[sectionKey].items, ...fetchedRecipes];

          const uniqueItems = Array.from(
            new Map(mergedItems.map((recipe) => [recipe.id, recipe])).values(),
          );

          return {
            ...prev,
            [sectionKey]: {
              ...prev[sectionKey],
              items: uniqueItems,
              cursor: lastVisible,
              hasMore,
              loading: false,
              error: '',
              initialised: true,
            },
          };
        });
      } catch (error) {
        console.error(`Error loading ${sectionKey}:`, error);
        setSections((prev) => ({
          ...prev,
          [sectionKey]: {
            ...prev[sectionKey],
            loading: false,
            error:
              error?.message ||
              'We hit a snag loading your recipes. Please try again.',
            initialised: true,
          },
        }));
      }
    },
    [profileUserId, isOwnProfile],
  );

  useEffect(() => {
    const state = sections[activeTab];
    if (!state.initialised && !state.loading) {
      fetchRecipesBySection(activeTab, true);
    }
  }, [activeTab, fetchRecipesBySection, sections]);

  const handleTabChange = useCallback(
    (nextTab) => {
      setActiveTab(nextTab);
    },
    [setActiveTab],
  );

  const handleSaveEditProfile = useCallback(
    async (event) => {
      event?.preventDefault();

      if (!validateForm()) {
        setSubmissionStatus('error');
        setSubmissionMessage('Please fix the highlighted issues.');
        return;
      }

      try {
        setSubmissionStatus('saving');
        setSubmissionMessage('Saving your changes...');

        const updates = {};

        // Update Firebase Auth profile
        if (auth.currentUser) {
          if (formState.name.trim() !== userData.name) {
            updates.displayName = formState.name.trim();
          }
          if (
            formState.profileImage &&
            formState.profileImage !== userData.profileImage
          ) {
            updates.photoURL = formState.profileImage;
          }

          if (formState.email.trim() !== userData.email) {
            await updateEmail(auth.currentUser, formState.email.trim());
          }

          if (Object.keys(updates).length > 0) {
            await updateProfile(auth.currentUser, updates);
          }

          await reloadUser?.();
        }

        // Save bio, displayName, and profile data to Firestore
        // This ensures other users can see the correct username
        const firestoreProfileData = {
          bio: formState.bio.trim() || 'Add bio',
          displayName: formState.name.trim(), // Save displayName to Firestore
        };

        if (formState.profileImage) {
          firestoreProfileData.profileImage = formState.profileImage;
        }

        await updateUserProfile(user.uid, firestoreProfileData);

        // Update local state
        setUserData((prev) => ({
          ...prev,
          name: formState.name.trim(),
          email: formState.email.trim(),
          bio: formState.bio.trim() || 'Add bio',
          profileImage: formState.profileImage,
          hasProfileImage: Boolean(formState.profileImage),
        }));

        setSubmissionStatus('success');
        setSubmissionMessage('Profile updated successfully.');
        setTimeout(() => {
          setIsEditModalOpen(false);
        }, 400);
      } catch (error) {
        console.error('Error updating profile:', error);
        setSubmissionStatus('error');
        setSubmissionMessage(
          error?.message ||
            'We could not update your profile. Please try again.',
        );
      }
    },
    [formState, reloadUser, userData, validateForm, user],
  );

  const handleLoadMore = useCallback(() => {
    fetchRecipesBySection(activeTab);
  }, [activeTab, fetchRecipesBySection]);

  const activeSection = sections[activeTab];

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  const recipeCards = useMemo(
    () =>
      activeSection.items.map((recipe) => (
        <article
          key={recipe.id}
          className="profile-recipes__card"
          onClick={() => {
            setSelectedRecipe(recipe);
            setIsRecipeModalOpen(true);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedRecipe(recipe);
              setIsRecipeModalOpen(true);
            }
          }}
          aria-label={`View recipe: ${recipe.title || 'Untitled recipe'}`}
        >
          <div className="profile-recipes__media">
            <img
              src={Array.isArray(recipe.imageUrls) && recipe.imageUrls.length > 0 ? recipe.imageUrls[0] : '/posts/placeholder.jpg'}
              alt={recipe.title || 'Recipe image'}
              loading="lazy"
            />
          </div>
          <div className="profile-recipes__body">
            <h3 className="profile-recipes__title">{recipe.title || 'Untitled recipe'}</h3>
            <p className="profile-recipes__meta">
              {recipe.duration ? `${recipe.duration} mins • ` : ''}
              {recipe.difficulty || 'Difficulty not set'}
            </p>
          </div>
        </article>
      )),
    [activeSection.items],
  );

  const handleViewActivityLogs = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Follow button component
  const FollowButton = ({ targetUserId, currentUserId }) => {
    const [following, setFollowing] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (currentUserId && targetUserId && currentUserId !== targetUserId) {
        isFollowing(currentUserId, targetUserId).then(setFollowing);
      }
    }, [currentUserId, targetUserId]);

    const handleFollowToggle = async () => {
      if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
        return;
      }

      setLoading(true);
      try {
        if (following) {
          await unfollowUser(currentUserId, targetUserId);
          setFollowing(false);
          // Update followers count
          const newCount = await getUserFollowersCount(targetUserId);
          setUserData((prev) => ({ ...prev, followers: newCount }));
        } else {
          await followUser(currentUserId, targetUserId);
          setFollowing(true);
          // Update followers count
          const newCount = await getUserFollowersCount(targetUserId);
          setUserData((prev) => ({ ...prev, followers: newCount }));
        }
      } catch (error) {
        console.error('Error toggling follow:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!currentUserId || currentUserId === targetUserId) {
      return null;
    }

    return (
      <button
        type="button"
        className="profile-hero__action-button"
        onClick={handleFollowToggle}
        disabled={loading}
      >
        {loading ? '...' : following ? 'Unfollow' : 'Follow'}
      </button>
    );
  };

  return (
    <HeaderSidebarLayout>
      <div className="profile-page">
        <div className="profile-page__inner">
          <section className="profile-hero">
            <div className="profile-hero__avatar-group">
              <div className="profile-hero__avatar-wrapper">
                {userData.hasProfileImage && userData.profileImage ? (
                  <img
                    className="profile-hero__avatar"
                    src={userData.profileImage}
                    alt={`${userData.name} profile`}
                  />
                ) : (
                  <div
                    className="profile-hero__avatar profile-hero__avatar--placeholder"
                    aria-hidden="true"
                  >
                    {userData.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div className="profile-hero__content">
              <div className="profile-hero__row">
                <div className="profile-hero__name-group">
                  <h1 className="profile-hero__name">{userData.name}</h1>
                  {userData.email && (
                    <p className="profile-hero__email">{userData.email}</p>
                  )}
                </div>
                <div className="profile-hero__actions">
                  {isOwnProfile ? (
                    <button
                      type="button"
                      className="profile-hero__action-button"
                      onClick={handleEditProfileOpen}
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <FollowButton targetUserId={profileUserId} currentUserId={user?.uid} />
                  )}
                  <div className="profile-hero__menu-wrapper" ref={dropdownRef}>
                    <button
                      type="button"
                      aria-label="More options"
                      className="profile-hero__more-button"
                      ref={menuButtonRef}
                      onClick={() => setIsMenuOpen((prev) => !prev)}
                    >
                      ⋮
                    </button>
                    {isMenuOpen && (
                      <div className="profile-hero__menu" role="menu">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleViewActivityLogs}
                          className="profile-hero__menu-item"
                        >
                          View Activity Logs
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <dl className="profile-hero__stats">
                <button
                  type="button"
                  className="profile-hero__stat-item"
                  onClick={() => {
                    // Optional: Navigate to posts modal or scroll to posts section
                    setActiveTab('own-recipes');
                    document.querySelector('.profile-tabs')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  aria-label={`${userData.posts} posts`}
                >
                  <dt>Posts</dt>
                  <dd>{userData.posts}</dd>
                </button>
                <div className="profile-hero__stat-item">
                  <dt>Followers</dt>
                  <dd>{userData.followers}</dd>
                </div>
                <div className="profile-hero__stat-item">
                  <dt>Following</dt>
                  <dd>{userData.following}</dd>
                </div>
              </dl>

              <div className="profile-hero__bio">
                {userData.bio === 'Add bio' ? (
                  <p className="profile-hero__bio-placeholder">
                    No bio yet. Click “Edit Profile” to add one.
                  </p>
                ) : (
                  <p>{userData.bio}</p>
                )}
              </div>

            </div>
          </section>

          <nav className="profile-tabs" aria-label="Profile sections">
            {/* Only show "Own Recipes" tab for other users' profiles */}
            {isOwnProfile
              ? Object.entries(SECTION_KEYS).map(([key, value]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === key}
                    className={`profile-tabs__button ${
                      activeTab === key ? 'profile-tabs__button--active' : ''
                    }`}
                    onClick={() => handleTabChange(key)}
                  >
                    {value.label}
                  </button>
                ))
              : (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'own-recipes'}
                    className="profile-tabs__button profile-tabs__button--active"
                    onClick={() => handleTabChange('own-recipes')}
                  >
                    {SECTION_KEYS['own-recipes'].label}
                  </button>
                )}
          </nav>

          <section
            className="profile-recipes"
            aria-live="polite"
          >
            {activeSection.loading && activeSection.items.length === 0 ? (
              <div className="profile-recipes__state profile-recipes__state--loading">
                <span className="profile-recipes__spinner" aria-hidden="true" />
                <p>Loading recipes...</p>
              </div>
            ) : null}

            {!activeSection.loading && activeSection.error ? (
              <div className="profile-recipes__state profile-recipes__state--error">
                <p>{activeSection.error}</p>
                <button
                  type="button"
                  className="profile-recipes__retry"
                  onClick={() => fetchRecipesBySection(activeTab, true)}
                >
                  Try again
                </button>
              </div>
            ) : null}

            {!activeSection.loading &&
              !activeSection.error &&
              activeSection.items.length === 0 ? (
                <div className="profile-recipes__state profile-recipes__state--empty">
                  <p>{SECTION_KEYS[activeTab].emptyMessage}</p>
                </div>
              ) : null}

            <div className="profile-recipes__grid">{recipeCards}</div>

            {activeSection.hasMore && !activeSection.loading ? (
              <div className="profile-recipes__load-more">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="profile-recipes__load-more-button"
                >
                  Load more
                </button>
              </div>
            ) : null}

            {activeSection.loading && activeSection.items.length > 0 ? (
              <div className="profile-recipes__loading-more">
                <span className="profile-recipes__spinner profile-recipes__spinner--small" aria-hidden="true" />
                <p>Fetching more recipes…</p>
              </div>
            ) : null}
          </section>
        </div>

        {isEditModalOpen && (
          <EditProfileModal
            formState={formState}
            formErrors={formErrors}
            uploadStatus={uploadStatus}
            submissionStatus={submissionStatus}
            submissionMessage={submissionMessage}
            onClose={handleEditProfileClose}
            onSubmit={handleSaveEditProfile}
            onInputChange={setFormState}
            onValidate={validateForm}
            onUploadPhoto={handleProfileImageUpload}
            onResetFeedback={() => {
              setSubmissionStatus('idle');
              setSubmissionMessage('');
            }}
          />
        )}

        {/* Recipe View Modal */}
        {isRecipeModalOpen && selectedRecipe && (
          <ViewPostModal
            isOpen={isRecipeModalOpen}
            onClose={() => {
              setIsRecipeModalOpen(false);
              setSelectedRecipe(null);
            }}
            recipe={selectedRecipe}
          />
        )}
      </div>
    </HeaderSidebarLayout>
  );
}

function EditProfileModal({
  formState,
  formErrors,
  uploadStatus,
  submissionStatus,
  submissionMessage,
  onClose,
  onSubmit,
  onInputChange,
  onValidate,
  onUploadPhoto,
  onResetFeedback,
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  const handleFieldChange = (field) => (event) => {
    onResetFeedback();
    onInputChange((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const profileInitial = formState.name.charAt(0).toUpperCase();

  return (
    <div
      className="edit-profile-modal__overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="edit-profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        onClick={(event) => event.stopPropagation()}
        ref={modalRef}
        tabIndex={-1}
      >
        <header className="edit-profile-modal__header">
          <h2 id="edit-profile-title">Edit Profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="edit-profile-modal__close"
            aria-label="Close edit profile modal"
          >
            ×
          </button>
        </header>

        <form
          className="edit-profile-modal__form"
          onSubmit={onSubmit}
          noValidate
        >
          <fieldset className="edit-profile-modal__fieldset">
            <legend className="edit-profile-modal__legend">Profile photo</legend>
            <div className="edit-profile-modal__avatar-stack">
              {formState.profileImage ? (
                <img
                  src={formState.profileImage}
                  alt="Selected profile"
                  className="edit-profile-modal__avatar"
                />
              ) : (
                <div
                  className="edit-profile-modal__avatar edit-profile-modal__avatar--placeholder"
                  aria-hidden="true"
                >
                  {profileInitial}
                </div>
              )}
              <button
                type="button"
                className="edit-profile-modal__upload"
                onClick={() => onUploadPhoto()}
                disabled={uploadStatus === 'uploading'}
              >
                {uploadStatus === 'uploading' ? 'Uploading…' : 'Change photo'}
              </button>
            </div>
            {formErrors.upload ? (
              <p className="edit-profile-modal__error" role="alert">
                {formErrors.upload}
              </p>
            ) : null}
          </fieldset>

          <div className="edit-profile-modal__grid">
            <label className="edit-profile-modal__field">
              <span className="edit-profile-modal__label">
                Display Name <span aria-hidden="true">*</span>
              </span>
              <input
                type="text"
                value={formState.name}
                onChange={handleFieldChange('name')}
                onBlur={onValidate}
                className={formErrors.name ? 'has-error' : ''}
                aria-invalid={Boolean(formErrors.name)}
                aria-describedby={formErrors.name ? 'edit-name-error' : undefined}
                required
              />
              {formErrors.name ? (
                <span id="edit-name-error" className="edit-profile-modal__error" role="alert">
                  {formErrors.name}
                </span>
              ) : null}
            </label>

            <label className="edit-profile-modal__field">
              <span className="edit-profile-modal__label">
                Email <span aria-hidden="true">*</span>
              </span>
              <input
                type="email"
                value={formState.email}
                onChange={handleFieldChange('email')}
                onBlur={onValidate}
                className={formErrors.email ? 'has-error' : ''}
                aria-invalid={Boolean(formErrors.email)}
                aria-describedby={formErrors.email ? 'edit-email-error' : undefined}
                required
              />
              {formErrors.email ? (
                <span id="edit-email-error" className="edit-profile-modal__error" role="alert">
                  {formErrors.email}
                </span>
              ) : null}
            </label>
          </div>

          <label className="edit-profile-modal__field edit-profile-modal__field--full">
            <span className="edit-profile-modal__label">Bio</span>
            <textarea
              value={formState.bio}
              onChange={handleFieldChange('bio')}
              onBlur={onValidate}
              maxLength={280}
              rows={4}
              className={formErrors.bio ? 'has-error' : ''}
              aria-invalid={Boolean(formErrors.bio)}
              aria-describedby={formErrors.bio ? 'edit-bio-error' : undefined}
              placeholder="Tell classmates what you love to cook, favorite ingredients, clubs, or go-to dorm hacks."
            />
            <span className="edit-profile-modal__help">
              {formState.bio.length}/280 characters
            </span>
            {formErrors.bio ? (
              <span id="edit-bio-error" className="edit-profile-modal__error" role="alert">
                {formErrors.bio}
              </span>
            ) : null}
          </label>

          {submissionMessage ? (
            <div
              className={`edit-profile-modal__feedback edit-profile-modal__feedback--${submissionStatus}`}
              role={submissionStatus === 'error' ? 'alert' : 'status'}
            >
              {submissionMessage}
            </div>
          ) : null}

          <footer className="edit-profile-modal__footer">
            <button
              type="button"
              className="edit-profile-modal__secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="edit-profile-modal__primary"
              disabled={submissionStatus === 'saving'}
            >
              {submissionStatus === 'saving' ? 'Saving…' : 'Save changes'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
