import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Filter } from "lucide-react";

export default function ReviewHeader({ onSearchChange, onFilterChange, availableFilters }) {
  const navigate = useNavigate();
  const location = useLocation();

  // --- 1. LOCAL STATE FOR SEARCH AND FILTER ---
  // Ensure default state is set to match the first item in availableFilters (usually 'All Time')
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState(availableFilters && availableFilters.length > 0 ? availableFilters[0] : 'All Time');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  
  const isFeedbackActive = location.pathname.includes("/admin/reviews/feedback") || location.pathname === "/admin/reviews";
  const isReportActive = location.pathname.includes("/admin/reviews/report");

  const handleFeedbackClick = () => {
    navigate("/admin/reviews/feedback");
  };

  const handleReportClick = () => {
    navigate("/admin/reviews/report");
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearchChange) {
      onSearchChange(query);
    }
  };

  const handleDateFilterSelect = (filter) => {
    setDateFilter(filter);
    setIsFilterMenuOpen(false);
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  // filterOptions is now the availableFilters prop

  return (
    <div 
      // PRESERVED ORIGINAL INLINE MARGINS
      className="self-stretch inline-flex justify-start items-center flex-wrap content-center" 
      style={{ marginTop: 20, marginLeft: 100 }} 
    >
      
      {/* Tabs Section */}
      <div className="p-2.5 flex justify-start items-center gap-3.5 flex-wrap content-center">
        {/* Feedbacks Tab */}
        <div 
          onClick={handleFeedbackClick}
          className={`w-40 h-9 relative overflow-hidden cursor-pointer ${
            isFeedbackActive ? "border-b-2 border-[#005236]" : "" 
          }`}
        >
          <div className={`left-4 top-1 absolute text-center justify-start text-base font-['Poppins'] ${
            isFeedbackActive ? "text-black font-bold" : "text-black font-normal"
          }`}>Feedbacks</div>
        </div>
        
        {/* Reports Tab */}
        <div 
          onClick={handleReportClick}
          className={`w-40 h-9 relative cursor-pointer ${
            isReportActive ? "border-b-2 border-[#005236]" : "" 
          }`}
        >
          <div className={`left-4 top-1 absolute text-center justify-start text-base font-['Poppins'] ${
            isReportActive ? "text-black font-bold" : "text-black font-normal"
          }`}>Reports</div>
        </div>
      </div>
      
      {/* Search and Filter Section - PRESERVING INLINE MARGINS and STRUCTURE */}
      <div 
        className="flex-1 min-w-[500px] p-2.5 flex justify-start items-start gap-2.5" 
        style={{ marginLeft: 30 }} 
      >
        <div 
          data-property-1="Default" 
          className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl h-10 sm:h-12 px-3 sm:px-4 py-2 bg-zinc-300/40 rounded-xl flex justify-between items-center gap-2 sm:gap-3"
        >
          <div className="flex-1 flex items-center gap-3">
            {/* Functional Input Field */}
            <Search className="w-5 h-5 text-gray-500 flex-shrink-0" style={{marginLeft: 10}} />
            <input
              type="text"
              placeholder="Search keyword, username, title..."
              className="flex-1 bg-transparent border-none outline-none text-black text-sm sm:text-base font-medium font-['Plus_Jakarta_Sans'] placeholder:text-black/50"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        
          {/* Filter Button and Dropdown - PRESERVING STRUCTURE */}
          <div className="relative">
            <button 
              className="p-2 h-10 sm:h-12 transition-colors group hover:bg-gray"
              onClick={() => setIsFilterMenuOpen(prev => !prev)}
              aria-expanded={isFilterMenuOpen}
              aria-controls="filter-dropdown"
            >
              <Filter 
                className="w-5 h-5 text-gray-500 transition-colors group-hover:text-green-700" 
                style={{ marginRight: 10, marginTop: 10 }} 
              />
            </button>

            {isFilterMenuOpen && (
              <div 
                id="filter-dropdown"
                className="absolute right-0 top-14 w-40 bg-white rounded-lg shadow-xl border border-gray-200 z-30 overflow-hidden"
                role="menu"
              >
                {/* Use availableFilters prop for options */}
                {availableFilters.map(filter => (
                  <button
                    key={filter}
                    onClick={() => handleDateFilterSelect(filter)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      dateFilter === filter 
                        ? 'bg-[#005236] font-bold text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    role="menuitem"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}