import React, { useState } from "react";
import SidebarLogoAdmin from "../components/SidebarLogoAdmin";
import ReviewHeader from "../components/ReviewHeader";
import { Pen, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminReportReview() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const reports = [
    {
      id: 1,
      username: "@KpopDemonRumi",
      avatar: "https://placehold.co/50x50",
      title: "THE BEST WEBSITE!",
      content: "I love this website! I enjoy cooking and I'm glad that I can see other's recipe as well!!",
      date: "October 28, 2025",
      status: ["New", "Pending"]
    },
    {
      id: 2,
      username: "@DerekRamsay",
      avatar: "https://placehold.co/50x50",
      title: "AMAZING!",
      content: "This site is amazing because I can share my own recipes to the world!",
      date: "July 01, 2025",
      status: ["Pending"]
    },
    {
      id: 3,
      username: "@ImDoneShiningNowImHiding",
      avatar: "https://placehold.co/50x50",
      title: "I like it",
      content: "This is the best!",
      date: "October 25, 2025",
      status: ["New", "Pending"]
    },
    {
      id: 4,
      username: "@ImVegan",
      avatar: "https://placehold.co/50x50",
      title: "So convenient",
      content: "Grabe! I searched just \"lettuce\" and it displayed all recipes that has lettuce in it?! THIS IS SO GREAT!",
      date: "October 02, 2025",
      status: ["Pending"]
    },
    {
      id: 5,
      username: "@FoodEnthusiast",
      avatar: "https://placehold.co/50x50",
      title: "Instant chef",
      content: "OMG! I didn't have lots of food in my ref rn so I opened this site to search for recipes that has the same ingredients as I have right now. AND BRUH! I'm so busog!",
      date: "July 03, 2025",
      status: ["Replied"],
      hasReply: true
    },
    {
      id: 6,
      username: "@FoodLover",
      avatar: "https://placehold.co/50x50",
      title: "Love it!",
      content: "Papara papa! LOVE KO TO!",
      date: "August 30, 2025",
      status: ["Replied"],
      hasReply: true
    }
  ];

  const handleCardClick = (report) => {
    setSelectedReport(report);
    setReplyText("");
  };

  const handleCloseModal = () => {
    setSelectedReport(null);
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

  const filteredReports = activeFilter === "All" 
    ? reports 
    : reports.filter(report => report.status.includes(activeFilter));

  return (
    <div className="w-full h-screen flex bg-gray-50">
      {/* Admin Sidebar */}
      <SidebarLogoAdmin />

      {/* Main content area */}
      <div className="flex-1 ml-0 lg:ml-48 flex flex-col h-screen min-w-0">
        <main className="flex-1 overflow-y-auto w-full max-w-full overflow-x-hidden mx-4 sm:mx-6 md:mx-8 lg:mx-10">
          <div className="w-full px-3 sm:px-5 md:px-6 lg:px-8 inline-flex flex-col justify-start items-start gap-6 sm:gap-8 md:gap-10 py-4 sm:py-6">
            <ReviewHeader />
            <div className="self-stretch inline-flex flex-col justify-start items-start gap-2">
              <div className="w-96 h-20 flex flex-col justify-start items-start gap-3">
                <div className="self-stretch flex-1 justify-start text-black text-2xl sm:text-3xl font-semibold font-['Poppins']">Report Inbox</div>
                <div className="self-stretch flex-1 justify-center text-black text-base sm:text-lg font-medium font-['Afacad']">Sort by:</div>
              </div>
              <div className="self-stretch p-2.5 inline-flex justify-start items-center gap-4 flex-wrap content-center">
                <div 
                  onClick={() => handleFilterClick("All")}
                  className={`w-24 h-8 px-3 py-1.5 rounded-[20px] shadow-[4px_5px_4px_0px_rgba(0,0,0,0.29)] inline-flex flex-col justify-center items-center gap-1 cursor-pointer hover:scale-105 transition-all duration-200 ${
                    activeFilter === "All" ? "bg-[#005236]/80 hover:bg-[#005236]" : "bg-[#6BC4A6] hover:bg-[#005236]"
                  }`}
                >
                  <div className={`text-center justify-start text-white text-xs sm:text-sm font-['Poppins'] ${activeFilter === "All" ? "font-bold" : "font-normal"}`}>All (53)</div>
                </div>
                <div 
                  onClick={() => handleFilterClick("Pending")}
                  className={`w-32 h-8 px-3 py-1.5 rounded-[20px] shadow-[4px_5px_4px_0px_rgba(0,0,0,0.29)] inline-flex flex-col justify-center items-center gap-1 cursor-pointer hover:scale-105 transition-all duration-200 ${
                    activeFilter === "Pending" ? "bg-[#005236]/80 hover:bg-[#005236]" : "bg-[#6BC4A6] hover:bg-[#005236]"
                  }`}
                >
                  <div className={`text-center justify-start text-white text-xs sm:text-sm font-['Poppins'] ${activeFilter === "Pending" ? "font-bold" : "font-normal"}`}>Pending (20)</div>
                </div>
                <div 
                  onClick={() => handleFilterClick("Replied")}
                  className={`w-28 h-8 px-3 py-1.5 rounded-[20px] shadow-[4px_5px_4px_0px_rgba(0,0,0,0.29)] inline-flex flex-col justify-center items-center gap-1 cursor-pointer hover:scale-105 transition-all duration-200 ${
                    activeFilter === "Replied" ? "bg-[#005236]/80 hover:bg-[#005236]" : "bg-[#6BC4A6] hover:bg-[#005236]"
                  }`}
                >
                  <div className={`text-center justify-start text-white text-xs sm:text-sm font-['Poppins'] ${activeFilter === "Replied" ? "font-bold" : "font-normal"}`}>Replied (33)</div>
                </div>
              </div>
            </div>
            <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 justify-items-center">
              {filteredReports.map((report) => (
                <div 
                  key={report.id}
                  onClick={() => handleCardClick(report)}
                  className="w-full max-w-sm h-48 bg-zinc-100 rounded-xl shadow-[-4px_4px_4px_0px_rgba(0,0,0,0.25)] outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex flex-col justify-start items-start gap-1.5 cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="px-7 py-3 inline-flex justify-start items-center gap-2">
                    <img className="w-12 h-12 rounded-full shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] object-cover" src={report.avatar} alt={report.username} />
                    <div className="justify-center text-black text-base font-normal font-['Afacad']">{report.username}</div>
                  </div>
                  <div className="self-stretch px-7 flex flex-col justify-start items-start gap-3 overflow-hidden">
                    <div className="self-stretch justify-center text-black text-lg sm:text-xl font-bold font-['Afacad']">{report.title}</div>
                    <div className="self-stretch h-16 justify-start text-black text-base font-normal font-['Afacad']">{report.content}</div>
                  </div>
                  <div className="self-stretch pl-7 inline-flex justify-between items-center">
                    <div className="py-2.5 flex justify-center items-center gap-2.5">
                      <div className="justify-center text-neutral-400 text-base font-normal font-['Afacad']">{report.date}</div>
                    </div>
                    <div className="px-3.5 flex justify-start items-center gap-1.5">
                      <div className="px-3.5 flex justify-start items-center gap-1.5">
                        {report.hasReply && (
                          <div data-property-1="Default" className="w-12 h-4 relative">
                            <div className="left-[1px] top-[2px] absolute text-center justify-center text-neutral-400 text-[10px] font-medium font-['Afacad']">Show reply</div>
                          </div>
                        )}
                        {report.status.map((status, idx) => (
                          <div key={idx} className="min-w-[60px] h-8 px-3 py-2 bg-[#6BC4A6] rounded-[30px] flex justify-center items-center">
                            <div className="text-center text-black text-sm font-normal font-['Afacad'] whitespace-nowrap">{status}</div>
                          </div>
                        ))}
                        <button 
                          className="w-8 h-8 p-1 bg-[#6BC4A6] rounded-2xl flex justify-center items-center gap-2.5 cursor-pointer hover:bg-[#005236] transition-colors"
                          title="Reply"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(report);
                          }}
                        >
                          <Pen className="w-4 h-4 text-black" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {selectedReport && (
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
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
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

              {/* Report Content */}
              <div className="flex flex-col gap-8 items-center">
                <div className="flex flex-col items-center gap-4">
                  <img 
                    className="w-16 h-16 rounded-full shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] object-cover" 
                    src={selectedReport.avatar} 
                    alt={selectedReport.username} 
                  />
                  <div className="text-center">
                    <div className="text-black text-xl font-semibold font-['Afacad'] mb-1">{selectedReport.username}</div>
                    <div className="text-neutral-400 text-sm font-normal font-['Afacad']">{selectedReport.date}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 items-center text-center w-full max-w-3xl px-4">
                  <div className="text-black text-2xl font-bold font-['Afacad']">{selectedReport.title}</div>
                  <div className="text-black text-base font-normal font-['Afacad'] leading-relaxed px-2">{selectedReport.content}</div>
                </div>

                <div className="flex flex-wrap gap-3 justify-center">
                  {selectedReport.status.map((status, idx) => (
                    <div key={idx} className="px-6 py-2 bg-[#6BC4A6] rounded-[30px] min-w-fit">
                      <div className="text-black text-sm font-normal font-['Afacad'] whitespace-nowrap">{status}</div>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleReplySubmit} className="flex flex-col gap-4 pt-4 border-t border-gray-200 w-full">
                  <label className="text-black text-lg font-semibold font-['Poppins'] text-center">Reply to Report</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    className="w-full min-h-[120px] px-4 py-3 bg-zinc-100 rounded-xl border-none outline-none text-black text-base font-normal font-['Afacad'] resize-none focus:ring-2 focus:ring-[#6BC4A6] text-center placeholder:text-center placeholder:text-gray-400 placeholder:opacity-60 flex items-center justify-center"
                    style={{ paddingTop: '2.5rem' }}
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
