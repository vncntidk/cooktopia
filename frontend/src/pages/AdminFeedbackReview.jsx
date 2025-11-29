import React, { useState } from "react";
import SidebarLogoAdmin from "../components/SidebarLogoAdmin";
import ReviewHeader from "../components/ReviewHeader";
import { Pen, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminReview() {
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

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
      // Handle reply submission here
      console.log("Reply submitted:", replyText);
      // You can add API call here
      alert("Reply submitted successfully!");
      handleCloseModal();
    }
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const filteredFeedbacks =
    activeFilter === "All"
      ? feedbacks
      : feedbacks.filter((feedback) => feedback.status.includes(activeFilter));

  return (
    <div className="w-full h-screen flex bg-gray-50">
      {/* Admin Sidebar */}
      <SidebarLogoAdmin />

      {/* Main content area */}
      {/* The parent <main> tag already contains overflow-y-auto, making the entire content scrollable */}
      <div className="flex-1 ml-0 lg:ml-48 flex flex-col h-screen min-w-0">
        <main className="flex-1 overflow-y-auto w-full max-w-full overflow-x-hidden mx-4 sm:mx-6 md:mx-8 lg:mx-10">
          <div className="w-full px-3 sm:px-5 md:px-6 lg:px-8 inline-flex flex-col justify-start items-start gap-6 sm:gap-8 md:gap-10 py-4 sm:py-6">
            <ReviewHeader />
            
            {/* Header and Filter Section */}
            <div className="self-stretch inline-flex flex-col justify-start items-start gap-4"style={{marginLeft: 80}}> 
              {/* Removed redundant style={{marginLeft: 80}} to ensure alignment with page content */}
              
              <div className="w-full flex flex-col justify-start items-start gap-2">
                <div className="self-stretch justify-start text-black text-2xl sm:text-3xl font-semibold font-['Poppins']">
                  Feedback Inbox
                </div>
                <div className="self-stretch justify-start text-black text-base sm:text-lg font-medium font-['Afacad']">
                  Sort by:
                </div>
              </div>

              <div className="self-stretch inline-flex justify-start items-center gap-3 flex-wrap">
                <div
                  onClick={() => handleFilterClick("All")}
                  className={`min-w-[80px] h-9 px-4 py-1.5 rounded-full shadow-md inline-flex justify-center items-center gap-1 cursor-pointer transition-all duration-200 ${
                    activeFilter === "All"
                      ? "bg-[#005236] font-bold text-white shadow-lg"
                      : "bg-[#6BC4A6] hover:bg-[#005236] text-black hover:text-white"
                  }`}
                >
                  <div className={`text-center text-xs sm:text-sm font-['Poppins']`}>
                    All (53)
                  </div>
                </div>
                <div
                  onClick={() => handleFilterClick("Pending")}
                  className={`min-w-[100px] h-9 px-4 py-1.5 rounded-full shadow-md inline-flex justify-center items-center gap-1 cursor-pointer transition-all duration-200 ${
                    activeFilter === "Pending"
                      ? "bg-[#005236] font-bold text-white shadow-lg"
                      : "bg-[#6BC4A6] hover:bg-[#005236] text-black hover:text-white"
                  }`}
                >
                  <div className={`text-center text-xs sm:text-sm font-['Poppins']`}>
                    Pending (20)
                  </div>
                </div>
                <div
                  onClick={() => handleFilterClick("Replied")}
                  className={`min-w-[90px] h-9 px-4 py-1.5 rounded-full shadow-md inline-flex justify-center items-center gap-1 cursor-pointer transition-all duration-200 ${
                    activeFilter === "Replied"
                      ? "bg-[#005236] font-bold text-white shadow-lg"
                      : "bg-[#6BC4A6] hover:bg-[#005236] text-black hover:text-white"
                  }`}
                >
                  <div className={`text-center text-xs sm:text-sm font-['Poppins']`}>
                    Replied (33)
                  </div>
                </div>
              </div>
            </div>

            <div
              className="
                self-stretch
                grid
                grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
                gap-4
                place-items-center
              "
          >


              {/* Changed lg:grid-cols-3 to xl:grid-cols-4 to enable 4 columns on extra large screens */}
              
              {filteredFeedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  onClick={() => handleCardClick(feedback)}
                  // Card Styling: Max width removed to let grid control size, height maintained
                  className="w-100 h-52 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col justify-between cursor-pointer"
                >
                  {/* Top: User Info and Avatar */}
                  <div className="p-4 flex items-center gap-3">
                    <img
                      className="w-11 h-11 rounded-full shadow-md object-cover flex-shrink-0"
                      src={feedback.avatar}
                      alt={feedback.username}
                    />
                    <div className="text-black text-base font-semibold font-['Afacad'] truncate">
                      {feedback.username}
                    </div>
                  </div>

                  {/* Middle: Title and Content Snippet */}
                  <div className="px-4 flex flex-col justify-start items-start gap-1.5 overflow-hidden flex-1">
                    <div className="text-black text-xl font-extrabold font-['Afacad'] leading-snug truncate w-full">
                      {feedback.title}
                    </div>
                    <div className="text-black text-sm font-normal font-['Afacad'] line-clamp-3">
                      {feedback.content}
                    </div>
                  </div>

                  {/* Bottom: Date, Status, and Action Button */}
                  <div className="p-4 pt-2 flex justify-between items-center">
                    <div className="text-neutral-500 text-xs font-normal font-['Afacad']">
                      {feedback.date}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Show Reply Tag (Simplified) */}
                      {feedback.hasReply && (
                        <div className="text-xs text-blue-600 font-medium">
                          Show Reply
                        </div>
                      )}
                      
                      {/* Status Tag */}
                      {feedback.status.map((status, idx) => (
                        <div
                          key={idx}
                          className={`min-w-fit px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                            status === "New" 
                              ? "bg-red-200 text-red-800"
                              : status === "Pending"
                              ? "bg-yellow-200 text-yellow-800"
                              : "bg-[#6BC4A6] text-black"
                          }`}
                        >
                          {status}
                        </div>
                      ))}

                      {/* Reply Button (Action) */}
                      <button
                        className="w-8 h-8 p-1 bg-[#6BC4A6] rounded-full flex justify-center items-center cursor-pointer hover:bg-[#005236] transition-colors flex-shrink-0"
                        title="Reply"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(feedback);
                        }}
                      >
                        <Pen className="w-4 h-4 text-black" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Feedback Modal (No changes) */}
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
              className="w-full max-w-2xl mx-4 bg-white rounded-[20px] shadow-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Feedback Content */}
              <div className="flex flex-col gap-8 items-center">
                <div className="flex flex-col items-center gap-4">
                  <img
                    className="w-16 h-16 rounded-full shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] object-cover"
                    src={selectedFeedback.avatar}
                    alt={selectedFeedback.username}
                  />
                  <div className="text-center">
                    <div className="text-black text-xl font-semibold font-['Afacad'] mb-1">
                      {selectedFeedback.username}
                    </div>
                    <div className="text-neutral-400 text-sm font-normal font-['Afacad']">
                      {selectedFeedback.date}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 items-center text-center w-full max-w-3xl px-4">
                  <div className="text-black text-2xl font-bold font-['Afacad']">
                    {selectedFeedback.title}
                  </div>
                  <div className="text-black text-base font-normal font-['Afacad'] leading-relaxed px-2">
                    {selectedFeedback.content}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 justify-center">
                  {selectedFeedback.status.map((status, idx) => (
                    <div
                      key={idx}
                      className="px-6 py-2 bg-[#6BC4A6] rounded-[30px] min-w-fit"
                    >
                      <div className="text-black text-sm font-normal font-['Afacad'] whitespace-nowrap">
                        {status}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <form
                  onSubmit={handleReplySubmit}
                  className="flex flex-col gap-4 pt-4 border-t border-gray-200 w-full"
                >
                  <label className="text-black text-lg font-semibold font-['Poppins'] text-center">
                    Reply to Feedback
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    className="w-full min-h-[120px] px-4 py-3 bg-zinc-100 rounded-xl border-none outline-none text-black text-base font-normal font-['Afacad'] resize-none focus:ring-2 focus:ring-[#6BC4A6] text-left placeholder:text-center placeholder:text-gray-400 placeholder:opacity-60"
                  />
                  <div className="flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="min-w-[100px] h-11 px-6 py-2.5 bg-gray-200 rounded-xl text-black text-base font-medium font-['Poppins'] hover:bg-gray-300 transition-colors flex items-center justify-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="min-w-[120px] h-11 px-6 py-2.5 bg-[#6BC4A6] rounded-xl text-black text-base font-medium font-['Poppins'] hover:bg-[#005236] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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