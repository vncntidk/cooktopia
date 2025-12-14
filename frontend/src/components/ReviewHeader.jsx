import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Filter, ChevronLeft, ChevronRight, X } from "lucide-react";

export default function ReviewHeader({ onSearchChange, onFilterChange, availableFilters }) {
  const navigate = useNavigate();
  const location = useLocation();

  // --- 1. LOCAL STATE FOR SEARCH AND FILTER ---
  const [searchQuery, setSearchQuery] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [displayText, setDisplayText] = useState('All Time');
  
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

  // Month/Year picker helper
  const monthNames = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"];
  
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handlePrevYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1));
  };

  const handleNextYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1));
  };

  const handleApplyFilter = () => {
    const monthYear = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
    setSelectedDate(currentMonth);
    setDisplayText(monthYear);
    setIsCalendarOpen(false);
    if (onFilterChange) {
      onFilterChange(monthYear);
    }
  };

  const handleClearFilter = () => {
    setSelectedDate(null);
    setDisplayText('All Time');
    setCurrentMonth(new Date());
    setIsCalendarOpen(false);
    if (onFilterChange) {
      onFilterChange('All Time');
    }
  };

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
          className={`w-40 h-9 flex items-center justify-center cursor-pointer ${
            isFeedbackActive ? "border-b-2 border-[#005236]" : "" 
          }`}
        >
          <div className={`text-center text-base font-['Poppins'] ${
            isFeedbackActive ? "text-black font-bold" : "text-black font-normal"
          }`}>Feedbacks</div>
        </div>
        
        {/* Reports Tab */}
        <div 
          onClick={handleReportClick}
          className={`w-40 h-9 flex items-center justify-center cursor-pointer ${
            isReportActive ? "border-b-2 border-[#005236]" : "" 
          }`}
        >
          <div className={`text-center text-base font-['Poppins'] ${
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
        
          {/* Month/Year Filter Button */}
          <div className="relative">
            <button 
              className="p-2 h-10 sm:h-12 transition-colors group hover:bg-gray"
              onClick={() => setIsCalendarOpen(prev => !prev)}
              aria-expanded={isCalendarOpen}
            >
              <Filter 
                className="w-5 h-5 text-gray-500 transition-colors group-hover:text-green-700" 
                style={{ marginRight: 10, marginTop: 10 }} 
              />
            </button>

            {isCalendarOpen && (
              <div 
                className="absolute right-0 top-14 bg-white rounded-2xl shadow-2xl border border-gray-100 z-30 p-5"
                style={{ width: 240, boxShadow: '0 10px 40px rgba(0,0,0,0.15)', paddingTop: 5, paddingBottom: 5 }}
              >
                {/* Header */}
                <div className="text-center" style={{ paddingTop: 5, paddingBottom: 5 }}>
                  <div className="text-sm font-semibold text-gray-500 font-['Poppins']">Filter by Date</div>
                </div>

                {/* Month Selector */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2 mb-3" style={{ paddingTop: 5, paddingBottom: 5 }}>
                  <button 
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-[#6BC4A6] hover:text-white rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="text-base font-bold text-[#005236] font-['Poppins']">
                    {monthNames[currentMonth.getMonth()]}
                  </div>
                  <button 
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-[#6BC4A6] hover:text-white rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Year Selector */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2 mb-4" style={{ paddingTop: 5, paddingBottom: 5 }}>
                  <button 
                    onClick={handlePrevYear}
                    className="p-2 hover:bg-[#6BC4A6] hover:text-white rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="text-base font-bold text-[#005236] font-['Poppins']">
                    {currentMonth.getFullYear()}
                  </div>
                  <button 
                    onClick={handleNextYear}
                    className="p-2 hover:bg-[#6BC4A6] hover:text-white rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2" style={{ paddingTop: 5, paddingBottom: 5 }}>
                  <button
                    onClick={handleApplyFilter}
                    className="w-full py-2.5 bg-[#005236] text-white text-sm font-bold rounded-xl hover:bg-[#003d28] transition-colors font-['Poppins']"
                    style={{ paddingTop: 5, paddingBottom: 5 }}
                  >
                    Apply Filter
                  </button>
                  <button
                    onClick={handleClearFilter}
                    className="w-full py-2 text-gray-500 hover:text-[#005236] text-sm font-medium transition-colors flex items-center justify-center gap-1 font-['Poppins']"
                    style={{ paddingTop: 5, paddingBottom: 5 }}
                  >
                    <X className="w-4 h-4" />
                    Clear Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}