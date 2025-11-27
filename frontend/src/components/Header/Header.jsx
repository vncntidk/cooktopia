import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsDropdownOpen(value.length > 0);
    setActiveIndex(0); // Reset to first item when typing
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isDropdownOpen) return;

    const searchOptions = getSearchOptions();

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % searchOptions.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + searchOptions.length) % searchOptions.length);
        break;
      case "Enter":
        e.preventDefault();
        handleOptionClick(searchOptions[activeIndex]);
        break;
      case "Escape":
        setIsDropdownOpen(false);
        break;
      default:
        break;
    }
  };

  // Get search options based on query
  const getSearchOptions = () => {
    return [
      {
        id: 1,
        label: `Search '${searchQuery}' in Recipes`,
        type: "recipe-title",
      },
      {
        id: 2,
        label: `Recipes with '${searchQuery}' as an ingredient`,
        type: "recipe-ingredient",
      },
      {
        id: 3,
        label: `Recipes with ONLY '${searchQuery}'`,
        type: "recipe-strict",
      },
      {
        id: 4,
        label: `Search '${searchQuery}' in Users`,
        type: "user-search",
      },
    ];
  };

  // Handle option click
  const handleOptionClick = (option) => {
    // Navigate to search results page with query params
    navigate(`/search?q=${encodeURIComponent(searchQuery)}&type=${option.type}`);
    setIsDropdownOpen(false);
    setSearchQuery(""); // Clear search after navigation
  };

  const searchOptions = getSearchOptions();

  return (
    <header
      className={`fixed top-0 left-0 w-[calc(100%-4rem)] bg-white z-50 flex items-center justify-between px-6 h-16 ${styles.header}`}
    >
      {/* Logo Section */}
      <div className={`flex items-center space-x-2 ${styles.logoWrapper}`}>
        <img
          src="/logo.png"
          alt="Cooktopia Logo"
          className="max-h-14 object-contain"
        />
      </div>

      {/* Search Bar with Dropdown */}
      <div className="relative" ref={searchRef}>
        <div className={`${styles.searchBar} flex items-center bg-gray-100 rounded-full`}>
          <img
            src="icons/searchIcon.png"
            className="w-4 h-4 mr-5"
            alt="Search"
          />
          <input
            type="text"
            placeholder="Search recipe, profile, and more"
            className="bg-transparent w-full outline-none text-gray-700 text-sm"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Search Dropdown */}
        {isDropdownOpen && searchQuery && (
          <div
            ref={dropdownRef}
            className="absolute top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-3"
            style={{ width: 'clamp(240px, 40vw, 560px)' }}
          >
            {searchOptions.map((option, index) => (
              <div
                key={option.id}
                className={`py-3 mb-1 cursor-pointer transition-colors ${
                  index === activeIndex
                    ? "bg-orange-200 text-gray-800"
                    : "bg-white text-gray-700 hover:bg-orange-200 hover:text-gray-800"
                }`}
                onClick={() => handleOptionClick(option)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <span className="text-sm font-medium" style={{ paddingLeft: '5px' }}>{option.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;