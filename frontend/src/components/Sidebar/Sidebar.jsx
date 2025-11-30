import React, { useState } from "react";
import styles from "./Sidebar.module.css";
import { useNavigate } from "react-router-dom";
//o
import NotificationModal from "../../modals/NotificationModal"; //for Notifications


const Sidebar = () => {
  const [active, setActive] = useState("home");
  const navigate = useNavigate();
  //Notifications modal state
    const showNotification = (message) => {
       setNotificationMessage(message);
       setIsModalOpen(true);
     };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');

  return (
    <aside
      className={`fixed top-0 right-0 h-full w-16 bg-white shadow-lg flex flex-col items-center py-6 z-40 ${styles.sidebar}`}
      aria-label="Sidebar"
    >
      {/* Profile */}
      <div className={`${styles.profileWrapper} flex flex-col items-center`}>
        <img
          src="/profile.png"
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover cursor-pointer hover:scale-105 transition-transform"
          onClick={() => navigate("/profile")}
        />
      </div>

      {/* Icons */}
      <div className="flex flex-col items-center gap-8 mt-2 flex-1 w-full">
        {/* Home */}
        <button
          onClick={() => setActive("home")}
          className="relative p-3 transition-all duration-200"
          aria-label="Home"
        >
          {active === "home" && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-r"></span>
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
          setActive("notifications");
          setIsModalOpen(prev => !prev);
          }}
          className="relative p-3 transition-all duration-200"
          aria-label="Notifications"
        >
          {active === "notifications" && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-r"></span>
          )}
          <img
            src={active === "notifications" ? "/icons/notifActive.png" : "/icons/notificationIcon.png"}
            alt="Notifications"
            className="w-10 h-10"
          />
        </button>


        {/* Messages */}
        <button
          onClick={() => setActive("messages")}
          className="relative p-3 transition-all duration-200"
          aria-label="Messages"
        >
          {active === "messages" && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-r"></span>
          )}
          <img
            src={active === "messages" ? "/icons/chatActive.png" : "/icons/chatIcon.png"}
            alt="Messages"
            className="w-10 h-10"
          />
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