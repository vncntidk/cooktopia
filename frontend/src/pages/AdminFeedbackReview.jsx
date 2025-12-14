import React, { useState, useMemo, useEffect } from "react";
import SidebarLogoAdmin from "../components/SidebarLogoAdmin";
import ReviewHeader from "../components/ReviewHeader";
import { Pen } from "lucide-react";
import FDreplymodal from "../modals/FDreplymodal";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for search and sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortFilter, setSortFilter] = useState('All Time');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'replied', 'awaiting'
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  const handleReplySubmit = (replyData) => {
    const newReply = {
      adminReply: replyData.adminReply,
      adminName: replyData.adminName,
      replyDate: replyData.replyDate,
    };

    setFeedbacks(prevFeedbacks => 
      prevFeedbacks.map(feedback => 
        feedback.id === replyData.id 
          ? { 
              ...feedback, 
              hasReply: true,
              adminReplies: [...(feedback.adminReplies || []), newReply],
              status: ["Replied"]
            }
          : feedback
      )
    );
    // Update selectedFeedback to show the reply immediately
    setSelectedFeedback(prev => prev ? {
      ...prev,
      hasReply: true,
      adminReplies: [...(prev.adminReplies || []), newReply],
      status: ["Replied"]
    } : null);
  };

  const handleCardClick = (feedback) => {
    setSelectedFeedback(feedback);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFeedback(null);
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

    // 3. Filtering by reply status
    if (activeFilter === 'replied') {
      tempFeedbacks = tempFeedbacks.filter(feedback => feedback.hasReply);
    } else if (activeFilter === 'awaiting') {
      tempFeedbacks = tempFeedbacks.filter(feedback => !feedback.hasReply);
    }
    
    // 4. Sorting (Default to Recent date, as other options were removed)
    tempFeedbacks.sort((a, b) => new Date(b.date) - new Date(a.date));

    return tempFeedbacks;
  }, [feedbacks, searchQuery, sortFilter, activeFilter]);


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

              {/* Filter Buttons */}
              <div className="self-stretch inline-flex justify-start items-center gap-3 flex-wrap">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`min-w-[80px] h-9 px-4 py-1.5 rounded-full inline-flex justify-center items-center gap-1 font-bold text-white shadow-lg transition-colors duration-200 cursor-pointer ${
                    activeFilter === 'all' ? 'bg-[#005236]' : 'bg-[#6BC4A6] hover:bg-[#005236]'
                  }`}
                >
                  <div className={`text-center text-xs sm:text-sm font-['Poppins']`}>
                    All ({feedbacks.length}) 
                  </div>
                </button>
                <button
                  onClick={() => setActiveFilter('replied')}
                  className={`min-w-[80px] h-9 px-4 py-1.5 rounded-full inline-flex justify-center items-center gap-1 font-bold text-white shadow-lg transition-colors duration-200 cursor-pointer ${
                    activeFilter === 'replied' ? 'bg-[#005236]' : 'bg-[#6BC4A6] hover:bg-[#005236]'
                  }`}
                  style={{padding: 10}}
                >
                  <div className={`text-center text-xs sm:text-sm font-['Poppins']`}>
                    Replied ({feedbacks.filter(f => f.hasReply).length}) 
                  </div>
                </button>
                <button
                  onClick={() => setActiveFilter('awaiting')}
                  className={`min-w-[80px] h-9 px-4 py-1.5 rounded-full inline-flex justify-center items-center gap-1 font-bold text-white shadow-lg transition-colors duration-200 cursor-pointer ${
                    activeFilter === 'awaiting' ? 'bg-[#005236]' : 'bg-[#6BC4A6] hover:bg-[#005236]'
                  }`}
                  style={{padding: 10}}
                >
                  <div className={`text-center text-xs sm:text-sm font-['Poppins']`}>
                    Awaiting ({feedbacks.filter(f => !f.hasReply).length}) 
                  </div>
                </button>
              </div>
            </div>
            
            {/* Feedback Cards Grid - PRESERVING INLINE STYLE */}
            <div
              className="
                grid
                grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
                gap-5
                place-items-center
              "
              style={{marginLeft: 80, paddingRight: 40, paddingBottom: 40}}
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
                  className="h-44 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-300 flex flex-col justify-between"
                  style={{paddingLeft: 15, paddingRight: 15, minWidth: 270, width: '100%'}}
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
                  <div className="px-4 flex flex-col justify-start items-start gap-1 overflow-hidden flex-1" style={{marginTop: 5, marginLeft: 15}}>
                    <div className="text-black text-base font-extrabold font-['Afacad'] leading-snug w-full">
                      {feedback.title}
                    </div>
                    <div className="text-black text-xs font-normal font-['Afacad'] line-clamp-2">
                      {feedback.content}
                    </div>
                  </div>

                  {/* Bottom: Date, Status, and Action Button - PRESERVING INLINE STYLE */}
                  <div className="p-3 pt-1 flex justify-between items-center" style={{marginLeft: 10}}>
                    <div className="text-neutral-500 text-xs font-normal font-['Afacad']">
                      {feedback.date}
                    </div>

                      {/* Reply Button (Action) */}
                      <button
                        className="w-6 h-6 p-1 bg-[#6BC4A6] rounded-full flex justify-center items-center cursor-pointer hover:bg-[#005236] transition-colors flex-shrink-0"
                        style={{marginRight: 10, marginBottom: 5}} 
                        title="Reply"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(feedback);
                        }}
                      >
                        <Pen className="w-3 h-3 text-black"/>
                      </button>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Feedback Reply Modal */}
      <FDreplymodal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        feedback={selectedFeedback}
        onReplySubmit={handleReplySubmit}
      />
    </div>
  );
}