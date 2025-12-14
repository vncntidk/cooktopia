import React, { useState, useMemo, useEffect } from "react";
import SidebarLogoAdmin from "../components/SidebarLogoAdmin";
import ReviewHeader from "../components/ReviewHeader";
import { Pen, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../config/firebase-config";
import { collection, onSnapshot, doc, getDoc, query, where } from "firebase/firestore";

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
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateAlert, setShowUpdateAlert] = useState(false);
  const [updatedFeedback, setUpdatedFeedback] = useState(null);

  // Fetch feedbacks from Firestore
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        
        // Listen to supportTickets where type is "feedback"
        const unsubscribe = onSnapshot(
          query(collection(db, "supportTickets"), where("type", "==", "feedback")),
          async (snapshot) => {
            const feedbacksData = [];

            for (const ticketDoc of snapshot.docs) {
              const ticketData = ticketDoc.data();
              
              // Fetch user data
              let userData = {
                displayName: "Unknown User",
                profileImage: "https://placehold.co/50x50"
              };

              if (ticketData.userId) {
                try {
                  const userDoc = await getDoc(doc(db, "users", ticketData.userId));
                  if (userDoc.exists()) {
                    const user = userDoc.data();
                    userData.displayName = user.displayName || "Unknown User";
                    userData.profileImage = user.profileImage || "https://placehold.co/50x50";
                  }
                } catch (error) {
                  console.error("Error fetching user:", error);
                }
              }

              // Format the date
              const createdAt = ticketData.createdAt?.toDate?.() || new Date(ticketData.createdAt);
              const formattedDate = createdAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

              feedbacksData.push({
                id: ticketDoc.id,
                username: `@${userData.displayName}`,
                avatar: userData.profileImage,
                title: ticketData.feedbackType || "Feedback",
                content: ticketData.message || "",
                date: formattedDate,
                dateObj: createdAt,
                status: ticketData.status === "closed" ? ["Replied"] : ["New", "Pending"],
                hasReply: ticketData.status === "closed",
                rawStatus: ticketData.status
              });
            }

            // Sort by date (most recent first)
            feedbacksData.sort((a, b) => b.dateObj - a.dateObj);
            
            // Check if currently selected feedback has changed
            if (selectedFeedback) {
              const updatedSelectedFeedback = feedbacksData.find(f => f.id === selectedFeedback.id);
              if (updatedSelectedFeedback) {
                // Compare if content changed
                const hasChanged = 
                  updatedSelectedFeedback.content !== selectedFeedback.content ||
                  updatedSelectedFeedback.rawStatus !== selectedFeedback.rawStatus ||
                  updatedSelectedFeedback.title !== selectedFeedback.title;
                
                if (hasChanged) {
                  setUpdatedFeedback(updatedSelectedFeedback);
                  setShowUpdateAlert(true);
                  // Don't update selectedFeedback yet - wait for user confirmation
                  setFeedbacks(feedbacksData);
                  setLoading(false);
                  return;
                }
              }
            }
            
            setFeedbacks(feedbacksData);
            setLoading(false);
          },
          (error) => {
            console.error("Error listening to feedbacks:", error);
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [selectedFeedback]);

  const handleCardClick = (feedback) => {
    setSelectedFeedback(feedback);
    setReplyText("");
    setShowUpdateAlert(false);
    setUpdatedFeedback(null);
  };

  const handleCloseModal = () => {
    setSelectedFeedback(null);
    setReplyText("");
    setShowUpdateAlert(false);
    setUpdatedFeedback(null);
  };

  const handleRefreshFeedback = () => {
    if (updatedFeedback) {
      setSelectedFeedback(updatedFeedback);
      setShowUpdateAlert(false);
      setUpdatedFeedback(null);
    }
  };

  const handleDismissAlert = () => {
    setShowUpdateAlert(false);
    setUpdatedFeedback(null);
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
              {/* Loading State */}
              {loading && (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6BC4A6] mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading feedbacks...</p>
                </div>
              )}

              {/* No Results State */}
              {!loading && filteredAndSortedFeedbacks.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 text-lg">No feedbacks found</p>
                </div>
              )}

              {/* Iterating over filteredAndSortedFeedbacks */}
              {!loading && filteredAndSortedFeedbacks.map((feedback) => (
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

              {/* Update Alert Banner */}
              {showUpdateAlert && (
                <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="text-yellow-800 font-semibold font-['Poppins'] mb-2">
                        ⚠️ This feedback has been updated
                      </p>
                      <p className="text-yellow-700 text-sm font-['Afacad']">
                        The content or status of this feedback has changed. Would you like to refresh to see the latest version?
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={handleRefreshFeedback}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-['Poppins'] text-sm font-semibold transition-colors"
                    >
                      Refresh Now
                    </button>
                    <button
                      onClick={handleDismissAlert}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-['Poppins'] text-sm transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

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