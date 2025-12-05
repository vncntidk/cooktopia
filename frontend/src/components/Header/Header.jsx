import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Header.module.css";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Preserve search query when on search page
  useEffect(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search);
      const queryParam = params.get('q');
      if (queryParam) {
        setSearchQuery(queryParam);
      }
    }
  }, [location]);

  // Handle input change
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page with query (mode defaults to 'all')
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      // Don't clear search - keep it in the input for user convenience
    }
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  return (
    <header
      className={`w-full bg-white z-50 flex items-center justify-between px-6 h-16 ${styles.header}`}
    >
      {/* Logo Section */}
      <div className={`flex items-center space-x-2 ${styles.logoWrapper}`}>
        <img
          src="/logo.png"
          alt="Cooktopia Logo"
          className="max-h-14 object-contain"
          onClick={() => navigate('/home')}
        />
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className={`${styles.searchBar} flex items-center bg-gray-100 rounded-full`}>
          <img
            src="icons/searchIcon.png"
            className="w-4 h-4 mr-5"
            alt="Search"
          />
          <input
            type="text"
            placeholder="Search recipes, ingredients, or users…"
            className="bg-transparent w-full outline-none text-gray-700 text-sm"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
        </div>
      </form>
    </header>
  );
};

export default Header;