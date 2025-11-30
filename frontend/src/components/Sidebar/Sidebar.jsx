import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";
<<<<<<< HEAD
import ProfileMenu from "../../pages/ProfileMenu";
=======
import NotificationModal from "../../modals/NotificationModal"; //for Notifications
import ProfileMenu from "../../pages/ProfileMenu";

>>>>>>> 48facd8e857b4c5b8e8a9825c2d5aa549462df36

const Sidebar = () => {
  const location = useLocation();
  const [active, setActive] = useState("home");
<<<<<<< HEAD
=======
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
>>>>>>> 48facd8e857b4c5b8e8a9825c2d5aa549462df36

  // Update active state based on current route
  useEffect(() => {
    if (location.pathname === "/home") {
      setActive("home");
    } else if (location.pathname === "/messages") {
      setActive("messages");
    } else if (location.pathname.includes("notifications")) {
      setActive("notifications");
    } else if (location.pathname.includes("/profile") || location.pathname === "/activity-logs") {
      // Don't highlight Home when on profile or activity logs pages
      setActive("");
    }
  }, [location]);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);

  return (
    <aside
      className={`fixed top-0 right-0 h-full w-16 bg-white shadow-lg flex flex-col items-center z-40 ${styles.sidebar}`}
      aria-label="Sidebar"
    >
      {/* Profile */}
      <div className={`${styles.profileWrapper} flex flex-col items-center relative`}>
<<<<<<< HEAD
        <img
          ref={profileRef}
          src="/profile.png"
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover cursor-pointer hover:scale-105 transition-transform"
=======
        <div 
          className="relative w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:scale-105 transition-transform"
>>>>>>> 48facd8e857b4c5b8e8a9825c2d5aa549462df36
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
        />
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
          />
        </button>

        {/* Notifications */}
        <button
          onClick={() => {
<<<<<<< HEAD
            setActive("notifications");
            // navigate("/notifications"); // Uncomment when notifications page is ready
          }}
          className="relative w-full flex justify-center items-center py-4 transition-all duration-200"
=======
          setActive("notifications");
          setIsModalOpen(prev => !prev);
          }}
          className="relative p-3 transition-all duration-200"
>>>>>>> 48facd8e857b4c5b8e8a9825c2d5aa549462df36
          aria-label="Notifications"
        >
          {active === "notifications" && (
            <span className={`${styles.icons} absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-10 bg-orange-500 rounded-r`}></span>
          )}
          <img
            src={active === "notifications" ? "/icons/notifActive.png" : "/icons/notificationIcon.png"}
            alt="Notifications"
            className="w-10 h-10"
          />
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
          <img
            src={active === "messages" ? "/icons/chatActive.png" : "/icons/chatIcon.png"}
            alt="Messages"
            className="w-10 h-10"
          />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;





