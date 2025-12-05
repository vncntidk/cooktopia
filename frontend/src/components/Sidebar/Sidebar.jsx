import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getUserProfile } from "../../services/users";
import { listenToUnreadCount } from "../../services/messagingService";
import { listenToUnreadNotificationCount, listenToUserNotifications } from "../../services/notifications";
import { getLastOpenedNotificationAt, updateLastOpenedNotificationAt } from "../../services/userPreferences";
import Avatar from "../Avatar";
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
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [lastOpenedNotificationAt, setLastOpenedNotificationAt] = useState(null);
  const prevModalOpenRef = useRef(false);
  const notificationUnsubscribeRef = useRef(() => {});

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

  // Set up persistent real-time notification badge listener (like messages)
  useEffect(() => {
    if (!user?.uid) {
      setUnreadNotificationCount(0);
      setLastOpenedNotificationAt(null);
      notificationUnsubscribeRef.current();
      notificationUnsubscribeRef.current = () => {};
      return;
    }

    let isMounted = true;

    // Load last opened timestamp and set up badge count listener
    const setupBadgeListener = async () => {
      try {
        const lastOpened = await getLastOpenedNotificationAt(user.uid);
        if (!isMounted) return;
        
        setLastOpenedNotificationAt(lastOpened);
        
        // Set up badge count listener with timestamp - always active
        notificationUnsubscribeRef.current = listenToUnreadNotificationCount(user.uid, (count) => {
          if (isMounted) {
            setUnreadNotificationCount(count);
          }
        }, lastOpened);
      } catch (error) {
        console.error('Error loading last opened notification timestamp:', error);
        if (isMounted) {
          setLastOpenedNotificationAt(null);
          // Fallback to unread count without timestamp - always active
          notificationUnsubscribeRef.current = listenToUnreadNotificationCount(user.uid, (count) => {
            if (isMounted) {
              setUnreadNotificationCount(count);
            }
          });
        }
      }
    };

    setupBadgeListener();

    return () => {
      isMounted = false;
      notificationUnsubscribeRef.current();
      notificationUnsubscribeRef.current = () => {};
    };
  }, [user?.uid]);

  // Update lastOpenedNotificationAt when modal opens
  useEffect(() => {
    if (isModalOpen && !prevModalOpenRef.current && user?.uid) {
      // Update timestamp when modal opens
      const updateTimestamp = async () => {
        try {
          await updateLastOpenedNotificationAt(user.uid);
          const newTimestamp = new Date();
          setLastOpenedNotificationAt(newTimestamp);
          
          // Re-setup badge count listener with new timestamp
          notificationUnsubscribeRef.current();
          notificationUnsubscribeRef.current = listenToUnreadNotificationCount(user.uid, (count) => {
            setUnreadNotificationCount(count);
          }, newTimestamp);
        } catch (error) {
          console.error('Error updating last opened notification timestamp:', error);
        }
      };
      updateTimestamp();
    }
    prevModalOpenRef.current = isModalOpen;
  }, [isModalOpen, user?.uid]);

  // Calculate displayed badge count: only show new notifications since last open
  // When modal is open, badge is 0. When closed, badge shows new notifications since last open.
  const displayedBadgeCount = isModalOpen ? 0 : unreadNotificationCount;

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
          ref={profileRef}
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
          <Avatar
            userId={user?.uid}
            profileImage={user?.photoURL}
            displayName={user?.displayName || user?.email?.split('@')[0] || 'User'}
            size="md"
            className={styles.profileAvatar}
          />
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





