import React, { useState, useMemo } from "react";
import SidebarLogoAdmin from "../components/SidebarLogoAdmin";
import ReviewHeader from "../components/ReviewHeader";
import { Pen, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Utility to generate filters based on date format
const getUniqueMonthYearFilters = (data) => {
    const dates = data.map(item => new Date(item.date));
    const uniqueMonths = new Set();
    
    const formatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' });

    for (const date of dates) {
        if (!isNaN(date)) {
             uniqueMonths.add(formatter.format(date));
        }
    }

    const sortedMonths = Array.from(uniqueMonths)
        .sort((a, b) => new Date(b) - new Date(a));
        
    return ['All Time', ...sortedMonths];
};


export default function AdminReview() {
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyText, setReplyText] = useState("");
  
  // State for search and sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortFilter, setSortFilter] = useState('All Time'); 

  const feedbacks = [
    {
      id: 1,
      username: "@KpopDemonRumi",
      avatar: "https://placehold.co/50x50",
      title: "THE BEST WEBSITE!",
      content: "I love this website! I enjoy cooking and I'm glad that I can see other's recipe as well!!",
      date: "October 28, 2025",
      status: ["New", "Pending"],
    },
    {
      id: 2,
      username: "@DerekRamsay",
      avatar: "https://placehold.co/50x50",
      title: "AMAZING!",
      content: "This site is amazing because I can share my own recipes to the world!",
      date: "July 01, 2025",
      status: ["Pending"],
    },
    {
      id: 3,
      username: "@ImDoneShiningNowImHiding",
      avatar: "https://placehold.co/50x50",
      title: "I like it",
      content: "This is the best!",
      date: "October 25, 2025",
      status: ["New", "Pending"],
    },
    {
      id: 4,
      username: "@ImVegan",
      avatar: "https://placehold.co/50x50",
      title: "So convenient",
      content: "Grabe! I searched just \"lettuce\" and it displayed all recipes that has lettuce in it?! THIS IS SO GREAT!",
      date: "October 02, 2025",
      status: ["Pending"],
    },
    {
      id: 5,
      username: "@FoodEnthusiast",
      avatar: "https://placehold.co/50x50",
      title: "Instant chef",
      content: "OMG! I didn't have lots of food in my ref rn so I opened this site to search for recipes that has the same ingredients as I have right now. AND BRUH! I'm so busog!",
      date: "July 03, 2025",
      status: ["Replied"],
      hasReply: true,
    },
    {
      id: 6,
      username: "@FoodLover",
      avatar: "https://placehold.co/50x50",
      title: "Love it!",
      content: "Papara papa! LOVE KO TO!",
      date: "August 30, 2025",
      status: ["Replied"],
      hasReply: true,
    },
  ];

  const handleCardClick = (feedback) => {
    setSelectedFeedback(feedback);
    setReplyText("");
  };

  const handleCloseModal = () => {
    setSelectedFeedback(null);
    setReplyText("");
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (replyText.trim()) {
      console.log("Reply submitted:", replyText);
      alert("Reply submitted successfully!");
      handleCloseModal();
    }
  };

  // --- Dynamic Filters and Filtered Array ---
  const availableFilters = useMemo(() => getUniqueMonthYearFilters(feedbacks), [feedbacks]);

  const filteredAndSortedFeedbacks = useMemo(() => {
    let tempFeedbacks = [...feedbacks];
    const query = searchQuery.toLowerCase();

    // 1. Filtering by keyword (username, title, content)
    if (query) {
      tempFeedbacks = tempFeedbacks.filter(feedback =>
        feedback.username.toLowerCase().includes(query) ||
        feedback.title.toLowerCase().includes(query) ||
        feedback.content.toLowerCase().includes(query)
      );
    }

    // 2. Filtering by Month/Year
    if (sortFilter !== 'All Time') {
        const [month, year] = sortFilter.split(' ');
        tempFeedbacks = tempFeedbacks.filter(feedback => {
            const reportDate = new Date(feedback.date);
            return reportDate.toLocaleString('en-US', { month: 'long' }) === month &&
                   reportDate.getFullYear().toString() === year;
        });
    }
    
    // 3. Sorting (Default to Recent date, as other options were removed)
    tempFeedbacks.sort((a, b) => new Date(b.date) - new Date(a.date));

    return tempFeedbacks;
  }, [feedbacks, searchQuery, sortFilter]);


  return (
    <div className="w-full h-screen flex bg-gray-50">
      {/* Admin Sidebar */}
      <SidebarLogoAdmin />

      {/* Main content area */}
      <div className="flex-1 ml-0 lg:ml-48 flex flex-col h-screen min-w-0">
        <main className="flex-1 overflow-y-auto w-full max-w-full overflow-x-hidden mx-4 sm:mx-6 md:mx-8 lg:mx-10">
          <div className="w-full px-3 sm:px-5 md:px-6 lg:px-8 inline-flex flex-col justify-start items-start gap-6 sm:gap-8 md:gap-10 py-4 sm:py-6">
            
            {/* ReviewHeader component now controls Search and Sort */}
            <ReviewHeader 
              onSearchChange={setSearchQuery} 
              onFilterChange={setSortFilter} 
              availableFilters={availableFilters} // Passed dynamic filters
            />
            
            {/* Header and Filter Section - PRESERVING INLINE STYLE */}
            <div className="self-stretch inline-flex flex-col justify-start items-start gap-4"style={{marginLeft: 80}}> 
              
              <div className="w-full flex flex-col justify-start items-start gap-2">
                <div className="self-stretch justify-start text-black text-2xl sm:text-3xl font-semibold font-['Poppins']">
                  Feedback Inbox
                </div>
                <div className="self-stretch justify-start text-black text-base sm:text-lg font-medium font-['Afacad']">
                  Total Feedbacks:
                </div>
              </div>

              {/* Static 'All' Count Display */}
              <div className="self-stretch inline-flex justify-start items-center gap-3 flex-wrap">
                <div
                  className={`min-w-[80px] h-9 px-4 py-1.5 rounded-full inline-flex justify-center items-center gap-1 bg-[#005236] font-bold text-white shadow-lg`}
                >
                  <div className={`text-center text-xs sm:text-sm font-['Poppins']`}>
                    All ({feedbacks.length}) 
                  </div>
                </div>
              </div>
            </div>
            
            {/* Feedback Cards Grid - PRESERVING INLINE STYLE */}
            <div
              className="
                grid
                grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
                gap-6
                place-items-center
              "
              style={{marginLeft: 120}}
            >
              {/* Iterating over filteredAndSortedFeedbacks */}
              {filteredAndSortedFeedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  onClick={() => handleCardClick(feedback)}
                  className="w-100 h-52 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-300 flex flex-col justify-between cursor-pointer"
                >
                  {/* Top: User Info and Avatar - PRESERVING INLINE STYLE */}
                  <div className="p-4 flex items-center gap-3">
                    <img
                      className="w-12 h-12 rounded-full shadow-md object-cover flex-shrink-0"
                      src={feedback.avatar}
                      alt={feedback.username}
                      style={{marginLeft: 10, marginTop: 10}}
                    />
                    <div className="text-black text-base font-semibold font-['Afacad'] truncate" style={{marginTop: 15}}>
                      {feedback.username}
                    </div>
                  </div>

                  {/* Middle: Title and Content Snippet - PRESERVING INLINE STYLE */}
                  <div className="px-4 flex flex-col justify-start items-start gap-1.5 overflow-hidden flex-1" style={{marginTop: 15, marginLeft: 20}}>
                    <div className="text-black text-xl font-extrabold font-['Afacad'] leading-snug truncate w-full">
                      {feedback.title}
                    </div>
                    <div className="text-black text-sm font-normal font-['Afacad'] line-clamp-3">
                      {feedback.content}
                    </div>
                  </div>

                  {/* Bottom: Date, Status, and Action Button - PRESERVING INLINE STYLE */}
                  <div className="p-4 pt-2 flex justify-between items-center" style={{marginLeft: 15}}>
                    <div className="text-neutral-500 text-xs font-normal font-['Afacad']">
                      {feedback.date}
                    </div>

                      {/* Reply Button (Action) */}
                      <button
                        className="w-8 h-8 p-1 bg-[#6BC4A6] rounded-full flex justify-center items-center cursor-pointer hover:bg-[#005236] transition-colors flex-shrink-0"
                        style={{marginRight: 10, marginBottom:10}} 
                        title="Reply"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(feedback);
                        }}
                      >
                        <Pen className="w-4 h-4 text-black"/>
                      </button>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Feedback Modal */}
      <AnimatePresence>
        {selectedFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl mx-4 bg-white rounded-[20px] shadow-2xl p-6 sm:p-8 max-h-[95vh] overflow-y-auto relative" 
            >
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors shadow-md z-10" 
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>

              {/* Feedback Content */}
              <div className="flex flex-col gap-6 sm:gap-8 items-center pt-2">
                
                {/* User Info */}
                <div className="flex flex-col items-center gap-3">
                  <img
                    className="w-16 h-16 rounded-full shadow-lg object-cover"
                    src={selectedFeedback.avatar}
                    alt={selectedFeedback.username}
                  />
                  <div className="text-center">
                    <div className="text-black text-xl font-bold font-['Poppins'] mb-0.5">
                      {selectedFeedback.username}
                    </div>
                    <div className="text-neutral-500 text-sm font-normal font-['Afacad']">
                      {selectedFeedback.date}
                    </div>
                  </div>
                </div>

                {/* Title and Content */}
                <div className="flex flex-col gap-3 items-center text-center w-full max-w-3xl px-4">
                  <div className="text-black text-3xl font-extrabold font-['Poppins']"> 
                    {selectedFeedback.title}
                  </div>
                  <div className="text-black text-base font-normal font-['Afacad'] leading-relaxed px-2 border-t border-b border-gray-100 py-4"> 
                    {selectedFeedback.content}
                  </div>
                </div>

                {/* Reply Form */}
                <form
                  onSubmit={handleReplySubmit}
                  className="flex flex-col gap-4 pt-6 border-t border-gray-200 w-full"
                >
                  <label className="text-black text-xl font-bold font-['Poppins'] text-center">
                    Reply to Feedback
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    className="w-full min-h-[140px] px-4 py-3 bg-zinc-100/80 rounded-xl border-2 border-transparent outline-none text-black text-base font-normal font-['Afacad'] resize-none focus:border-[#6BC4A6] focus:ring-4 focus:ring-[#6BC4A6]/20 placeholder:text-center placeholder:text-gray-500 placeholder:opacity-80"
                  />
                  <div className="flex justify-center gap-4 pt-2">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="min-w-[100px] h-11 px-6 bg-gray-200 rounded-full text-black text-base font-medium font-['Poppins'] hover:bg-gray-300 transition-colors shadow-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="min-w-[120px] h-11 px-6 bg-[#6BC4A6] rounded-full text-black text-base font-bold font-['Poppins'] hover:bg-[#005236] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      Send Reply
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}