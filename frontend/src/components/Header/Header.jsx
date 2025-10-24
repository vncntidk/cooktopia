import React from "react";
import styles from "./Header.module.css";

const Header = () => {
  return (
    <header
      className={`fixed top-0 left-0 w-[calc(100%-4rem)] bg-white z-50 flex items-center justify-between px-6 h-16 ${styles.header}`}
      style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
    >
      {/* Logo Section */}
      <div className={`flex items-center space-x-2 ${styles.logoWrapper}`}>
        <img
          src="/logo.png"
          alt="Cooktopia Logo"
          className="max-h-14 object-contain"
        />
      </div>

      <div className={`${styles.searchBar} flex items-center bg-gray-100 rounded-full`}>
        <i className="fas fa-search text-gray-400 mr-2"></i>
        <img
          src="icons/searchIcon.png"
          className="w-4 h-4 mr-5"
        />
        <input
          type="text"
          placeholder="Search recipe, profile, and more"
          className="bg-transparent w-full outline-none text-gray-700 text-sm"
        />
        <img
          src="icons/filterIcon.png"
          className="w-5 h-5 ml-2 cursor-pointer hover:opacity-80 transition"
        />
      </div>
    </header>
  );
};

export default Header;