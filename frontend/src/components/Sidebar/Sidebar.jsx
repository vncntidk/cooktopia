import React, { useState } from "react";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
    const [active, setActive] = useState("home");
  return (
    <aside
      className={`fixed top-0 right-0 h-full w-16 bg-white shadow-lg flex flex-col items-center justify-between py-6 z-40 ${styles.sidebar}`}
    >
      {/* Profile */}
      <div className="flex flex-col items-center space-y-6">
        <img
          src="/profile.png"
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover cursor-pointer hover:scale-105  transition-transform"
        />
      </div>

      {/* Icons */}
      <div className="flex flex-col items-center space-y-12">
        {/* Home */}
        <button
          onClick={() => setActive("home")}
          className={`relative p-3 text-gray-50 transition-all duration-200 ${
            active === "home" ? "" : ""
          }`}
        >
          {active === "home" && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-r"></span>
          )}
        <img
            src={active === "home" ? "/icons/homeActive.png" : "/icons/homeIcon.png"}
            alt="Home"
            className="w-6 h-6"
        />
        </button>

        {/* Notifications */}
        <button
          onClick={() => setActive("notifications")}
          className={`relative p-3 text-gray-500 transition-all duration-200 ${
            active === "notifications" ? "" : ""
          }`}
        >
          {active === "notifications" && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-r"></span>
          )}
        <img
            src={active === "notifications" ? "/icons/notifActive.png" : "/icons/notificationIcon.png"}
            alt="Notifications"
            className="w-6 h-6"
        />
        </button>

        {/* Messages */}
        <button
          onClick={() => setActive("messages")}
          className={`relative p-3 text-gray-500 transition-all duration-200 ${
            active === "messages" ? "" : ""
          }`}
        >
          {active === "messages" && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-r"></span>
          )}
        <img
            src={active === "messages" ? "/icons/chatActive.png" : "/icons/chatIcon.png"}
            alt="Messages"
            className="w-6 h-6"
        />
        </button>
      </div>


      <div className="flex flex-col items-center">
        <img
          src="icons/createIcon.png" 
          alt="Add Recipe"
          className="w-12 h-12 cursor-pointer hover:rotate-90 transition-transform"
        />
      </div>
    </aside>
  );
};

export default Sidebar;
