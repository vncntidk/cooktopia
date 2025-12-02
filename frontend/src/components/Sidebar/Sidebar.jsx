import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getUserProfile } from "../../services/users";
import { listenToUnreadCount } from "../../services/messagingService";
import { listenToUnreadNotificationCount } from "../../services/notifications";
import styles from "./Sidebar.module.css";
import NotificationModal from "../../modals/NotificationModal"; //for Notifications
import ProfileMenu from "../../pages/ProfileMenu";


const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [active, setActive] = useState("home");
  const navigate = useNavigate();

  //Notifications modal state
  const showNotification = (message) => {
      setNotificationMessage(message);
      setIsModalOpen(true);
    };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [lastViewedNotificationCount, setLastViewedNotificationCount] = useState(0);
  const prevModalOpenRef = useRef(false);

  // Update active state based on current route
  useEffect(() => {
    if (location.pathname === "/home") {
      setActive("home");
    } else if (location.pathname === "/messages") {
      setActive("messages");
    } else if (location.pathname.includes("notifications")) {
      setActive("notifications");
    } else if (location.pathname.includes("/profile") || location.pathname === "/activity-logs" || location.pathname === "/search") {
      // Don't highlight any sidebar item when on profile, activity logs, or search pages
      setActive("");
    }
  }, [location]);

  // Load user profile image
  useEffect(() => {
    const loadProfileImage = async () => {
      if (user?.uid) {
        try {
          const userProfile = await getUserProfile(user.uid);
          // Use profileImage from Firestore, or photoURL from Auth, or fallback
          const imageUrl = userProfile?.profileImage || user?.photoURL || null;
          setProfileImage(imageUrl);
          setIsImageLoaded(false);
          setImageError(false);
        } catch (error) {
          console.error("Error loading profile image:", error);
          // Fallback to Auth photoURL or null
          const imageUrl = user?.photoURL || null;
          setProfileImage(imageUrl);
          setIsImageLoaded(false);
          setImageError(false);
        }
      } else {
        setProfileImage(null);
        setIsImageLoaded(false);
        setImageError(false);
      }
    };

    loadProfileImage();
  }, [user?.uid, user?.photoURL]);

  // Preload image to check if it exists and is loadable
  useEffect(() => {
    if (!profileImage) {
      setIsImageLoaded(false);
      setImageError(true);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setIsImageLoaded(true);
      setImageError(false);
    };
    img.onerror = () => {
      setIsImageLoaded(false);
      setImageError(true);
    };
    img.src = profileImage;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [profileImage]);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsImageLoaded(false);
    setImageError(true);
  };

  // Listen to unread conversations count
  useEffect(() => {
    if (!user?.uid) {
      setUnreadCount(0);
      return;
    }

    const unsubscribe = listenToUnreadCount(user.uid, (count) => {
      setUnreadCount(count);
    });

    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  // Listen to unread notifications count
  useEffect(() => {
    if (!user?.uid) {
      setUnreadNotificationCount(0);
      setLastViewedNotificationCount(0);
      return;
    }

    const unsubscribe = listenToUnreadNotificationCount(user.uid, (count) => {
      setUnreadNotificationCount(count);
    });

    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  // Reset badge count when modal opens (but don't mark notifications as read)
  useEffect(() => {
    // Only update when modal transitions from closed to open
    if (isModalOpen && !prevModalOpenRef.current) {
      // Store the current unread count as the "last viewed" count
      // This resets the badge to 0 when modal opens
      setLastViewedNotificationCount(unreadNotificationCount);
    }
    prevModalOpenRef.current = isModalOpen;
  }, [isModalOpen, unreadNotificationCount]);

  // Calculate displayed badge count: only show new notifications since last view
  // When modal is open, badge is 0. When closed, badge shows new notifications since last open.
  const displayedBadgeCount = isModalOpen 
    ? 0 
    : Math.max(0, unreadNotificationCount - lastViewedNotificationCount);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);

  return (
    <aside
      className={`fixed top-0 right-0 h-full w-16 bg-white shadow-lg flex flex-col items-center z-40 ${styles.sidebar}`}
      aria-label="Sidebar"
    >
      {/* Profile */}
      <div className={`${styles.profileWrapper} flex flex-col items-center relative`}>
        <div 
          className="relative w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          role="button"
          tabIndex={0}
          aria-label="Profile menu"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsProfileMenuOpen(!isProfileMenuOpen);
            }
          }}
        >
          {/* Skeleton placeholder - shown while image is loading */}
          {profileImage && !isImageLoaded && (
            <div className={styles.profileSkeleton} aria-hidden="true" />
          )}
          
          {/* Actual image - only shown once loaded */}
          {profileImage && (
            <img
              ref={profileRef}
              src={profileImage}
              alt="Profile"
              className={`${styles.profileImage} ${
                isImageLoaded ? styles.profileImageLoaded : styles.profileImageHidden
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
          
          {/* Fallback placeholder - shown when no image or image failed */}
          {(!profileImage || imageError) && (
            <div className={styles.profilePlaceholder} aria-hidden="true">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>
        <ProfileMenu
          isOpen={isProfileMenuOpen}
          onClose={() => setIsProfileMenuOpen(false)}
          profileRef={profileRef}
        />
      </div>

      {/* Icons */}
      <div className="flex flex-col items-center gap-8 mt-2 flex-1 w-full">
        {/* Home */}
        <button
          onClick={() => {
            setActive("home");
            navigate("/home");
          }}
          className="relative w-full flex justify-center items-center py-4 transition-all duration-200"
          aria-label="Home"
        >
          {active === "home" && (
            <span className={`${styles.icons} absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-10 bg-orange-500 rounded-r`}></span>
          )}
          <img
            src={active === "home" ? "/icons/homeActive.png" : "/icons/homeIcon.png"}
            alt="Home"
            className="w-10 h-10"
            onClick={() => navigate("/home")}
          />
        </button>

        {/* Notifications */}
        <button
          onClick={() => {
            setIsModalOpen(prev => !prev);
          }}
          className="relative p-3 transition-all duration-200"
          aria-label="Notifications"
        >
          {isModalOpen && (
            <span className={`${styles.icons} absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-10 bg-orange-500 rounded-r`}></span>
          )}
          <div className="relative">
            <img
              src={isModalOpen ? "/icons/notifActive.png" : "/icons/notificationIcon.png"}
              alt="Notifications"
              className="w-10 h-10"
            />
            {displayedBadgeCount > 0 && (
              <span className={styles.unreadBadge} aria-label={`${displayedBadgeCount} new notifications`}>
                {displayedBadgeCount > 99 ? '99+' : displayedBadgeCount}
              </span>
            )}
          </div>
        </button>


        {/* Messages */}
        <button
          onClick={() => {
            setActive("messages");
            navigate("/messages");
          }}
          className="relative w-full flex justify-center items-center py-4 transition-all duration-200"
          aria-label="Messages"
        >
          {active === "messages" && (
            <span className={`${styles.icons} absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-10 bg-orange-500 rounded-r`}></span>
          )}
          <div className="relative">
            <img
              src={active === "messages" ? "/icons/chatActive.png" : "/icons/chatIcon.png"}
              alt="Messages"
              className="w-10 h-10"
            />
            {unreadCount > 0 && (
              <span className={styles.unreadBadge} aria-label={`${unreadCount} unread conversations`}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        </button>
      </div>
      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message={notificationMessage} // empty string by default; so no default message will show
      />
    </aside>
    
  );
};

export default Sidebar;





