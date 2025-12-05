import React, { useState, useMemo } from "react";
import SidebarLogoAdmin from "../components/SidebarLogoAdmin";
import ReviewHeader from "../components/ReviewHeader";
import { Pen } from "lucide-react";
import Repreplymodal from "../modals/Repreplymodal";

// Utility to generate filters based on date format
const getUniqueMonthYearFilters = (data) => {
    const dates = data.map(item => new Date(item.date));
    const uniqueMonths = new Set();
    
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });

    for (const date of dates) {
        if (!isNaN(date)) {
             uniqueMonths.add(formatter.format(date));
        }
    }

    const sortedMonths = Array.from(uniqueMonths)
        .sort((a, b) => new Date(b) - new Date(a));
        
    return ['All Time', ...sortedMonths];
};


export default function AdminReportReview() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for search and sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortFilter, setSortFilter] = useState('All Time');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'replied', 'awaiting'

  // Data array
  const [reports, setReports] = useState([
    {
      id: 1,
      username: "@ConcernedUser",
      avatar: "https://placehold.co/50x50",
      title: "Inappropriate Recipe Content",
      content: "User @TrollAccount123 posted a recipe with offensive language in the description. The recipe titled 'Special Dish' contains inappropriate words. Please review and take action.",
      date: "November 18, 2025",
      status: ["New", "Pending"],
    },
    {
      id: 2,
      username: "@SafetyFirst",
      avatar: "https://placehold.co/50x50",
      title: "Dangerous Recipe Instructions",
      content: "Someone posted a recipe with unsafe cooking instructions that could cause injury. The recipe tells users to heat oil at extremely high temperatures without proper warnings.",
      date: "November 12, 2025",
      status: ["New", "Pending"],
    },
    {
      id: 3,
      username: "@HealthWatch",
      avatar: "https://placehold.co/50x50",
      title: "Misleading Health Claims",
      content: "A recipe is claiming to cure diseases which is misleading and potentially dangerous. The post by @MiracleChef claims their soup can cure diabetes. This is irresponsible.",
      date: "October 30, 2025",
      status: ["Pending"],
    },
    {
      id: 4,
      username: "@OriginalChef",
      avatar: "https://placehold.co/50x50",
      title: "Stolen Recipe - Copyright Issue",
      content: "User @CopyPaste stole my original recipe word-for-word and posted it as their own! I spent weeks perfecting my Chicken Adobo recipe and they just copied everything including my photos.",
      date: "October 25, 2025",
      status: ["Pending"],
    },
    {
      id: 5,
      username: "@CommunityHelper",
      avatar: "https://placehold.co/50x50",
      title: "Spam Account Detected",
      content: "The account @BuyNowCheap is posting spam links in recipe comments. They're promoting external websites and scam products. I've seen them comment on at least 10 recipes today.",
      date: "September 20, 2025",
      status: ["Replied"],
      hasReply: true,
      adminReplies: [
        {
          adminName: "Admin Mike",
          adminReply: "Thank you for reporting this spam account. We have reviewed the activity and permanently banned @BuyNowCheap from the platform. All spam comments have been removed. We appreciate your help keeping the community safe!",
          replyDate: "September 21, 2025",
        }
      ],
    },
    {
      id: 6,
      username: "@RespectfulUser",
      avatar: "https://placehold.co/50x50",
      title: "Harassment in Comments",
      content: "User @MeanCommenter has been leaving rude and hurtful comments on multiple recipes. They insulted my cooking and used offensive language. This behavior is affecting the community.",
      date: "September 10, 2025",
      status: ["Replied"],
      hasReply: true,
      adminReplies: [
        {
          adminName: "Admin Sarah",
          adminReply: "We're sorry you experienced this harassment. We have reviewed the reported comments and taken action against @MeanCommenter. They have received a warning and their offensive comments have been removed. If this continues, their account will be suspended.",
          replyDate: "September 11, 2025",
        }
      ],
    },
    {
      id: 7,
      username: "@AllergyAware",
      avatar: "https://placehold.co/50x50",
      title: "Missing Allergen Information",
      content: "A popular recipe contains peanuts but doesn't list it in the ingredients or allergen warnings. This could be dangerous for people with peanut allergies. Please require allergen labels.",
      date: "August 28, 2025",
      status: ["Replied"],
      hasReply: true,
      adminReplies: [
        {
          adminName: "Admin Mike",
          adminReply: "Thank you for bringing this important safety concern to our attention. We have contacted the recipe author to update the allergen information. We're also working on implementing mandatory allergen labels for all recipes. Your feedback helps make Cooktopia safer for everyone!",
          replyDate: "August 29, 2025",
        }
      ],
    },
    {
      id: 8,
      username: "@TechSupport",
      avatar: "https://placehold.co/50x50",
      title: "Bug: Images Not Loading",
      content: "I've noticed that recipe images are not loading properly on mobile devices. This has been happening for the past 3 days. Other users in the community are experiencing the same issue.",
      date: "August 15, 2025",
      status: ["Pending"],
    },
  ]);

  const handleReplySubmit = (replyData) => {
    const newReply = {
      adminReply: replyData.adminReply,
      adminName: replyData.adminName,
      replyDate: replyData.replyDate,
    };

    setReports(prevReports => 
      prevReports.map(report => 
        report.id === replyData.id 
          ? { 
              ...report, 
              hasReply: true,
              adminReplies: [...(report.adminReplies || []), newReply],
              status: ["Replied"]
            }
          : report
      )
    );
    // Update selectedReport to show the reply immediately
    setSelectedReport(prev => prev ? {
      ...prev,
      hasReply: true,
      adminReplies: [...(prev.adminReplies || []), newReply],
      status: ["Replied"]
    } : null);
  };

  const handleCardClick = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  // --- Dynamic Filters and Filtered Array ---
  const availableFilters = useMemo(() => getUniqueMonthYearFilters(reports), [reports]);

  const filteredAndSortedReports = useMemo(() => {
    let tempReports = [...reports];
    const query = searchQuery.toLowerCase();

    // 1. Filtering by keyword (username, title, content)
    if (query) {
      tempReports = tempReports.filter(report =>
        report.username.toLowerCase().includes(query) ||
        report.title.toLowerCase().includes(query) ||
        report.content.toLowerCase().includes(query)
      );
    }

    // 2. Filtering by Month/Year
    if (sortFilter !== 'All Time') {
        const [month, year] = sortFilter.split(' ');
        tempReports = tempReports.filter(report => {
            const reportDate = new Date(report.date);
            return reportDate.toLocaleString('en-US', { month: 'long' }) === month &&
                   reportDate.getFullYear().toString() === year;
        });
    }

    // 3. Filtering by reply status
    if (activeFilter === 'replied') {
      tempReports = tempReports.filter(report => report.hasReply);
    } else if (activeFilter === 'awaiting') {
      tempReports = tempReports.filter(report => !report.hasReply);
    }
    
    // 4. Sorting (Default to Recent date)
    tempReports.sort((a, b) => new Date(b.date) - new Date(a.date));

    return tempReports;
  }, [reports, searchQuery, sortFilter, activeFilter]);


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
                  Report Inbox
                </div>
                <div className="self-stretch justify-start text-black text-base sm:text-lg font-medium font-['Afacad']">
                  Total Reports:
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="self-stretch inline-flex justify-start items-center gap-3 flex-wrap">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`min-w-[80px] h-9 px-4 py-1.5 rounded-full shadow-md inline-flex justify-center items-center gap-1 font-bold text-white shadow-lg transition-colors duration-200 cursor-pointer ${
                    activeFilter === 'all' ? 'bg-[#005236]' : 'bg-[#6BC4A6] hover:bg-[#005236]'
                  }`}
                >
                  <div className={`text-center text-xs sm:text-sm font-['Poppins']`}>
                    All ({reports.length}) 
                  </div>
                </button>
                <button
                  onClick={() => setActiveFilter('replied')}
                  className={`min-w-[80px] h-9 px-4 py-1.5 rounded-full shadow-md inline-flex justify-center items-center gap-1 font-bold text-white shadow-lg transition-colors duration-200 cursor-pointer ${
                    activeFilter === 'replied' ? 'bg-[#005236]' : 'bg-[#6BC4A6] hover:bg-[#005236]'
                  }`}
                  style={{padding: 10}}
                >
                  <div className={`text-center text-xs sm:text-sm font-['Poppins']`}>
                    Replied ({reports.filter(r => r.hasReply).length}) 
                  </div>
                </button>
                <button
                  onClick={() => setActiveFilter('awaiting')}
                  className={`min-w-[80px] h-9 px-4 py-1.5 rounded-full shadow-md inline-flex justify-center items-center gap-1 font-bold text-white shadow-lg transition-colors duration-200 cursor-pointer ${
                    activeFilter === 'awaiting' ? 'bg-[#005236]' : 'bg-[#6BC4A6] hover:bg-[#005236]'
                  }`}
                  style={{padding: 10}}
                >
                  <div className={`text-center text-xs sm:text-sm font-['Poppins']`}>
                    Awaiting ({reports.filter(r => !r.hasReply).length}) 
                  </div>
                </button>
              </div>
            </div>
            
            {/* Report Cards Grid - PRESERVING INLINE STYLE */}
            <div
              className="
                grid
                grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
                gap-5
                place-items-center
              "
              style={{marginLeft: 80, paddingRight: 40, paddingBottom: 40}} 
            >
              {/* Iterating over filteredAndSortedReports */}
              {filteredAndSortedReports.map((report) => ( 
                <div
                  key={report.id}
                  className="h-44 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-300 flex flex-col justify-between"
                  style={{paddingLeft: 15, paddingRight: 15, minWidth: 270, width: '100%'}}
                >
                  {/* Top: User Info and Avatar - PRESERVING INLINE STYLE */}
                  <div className="p-4 flex items-center gap-3">
                    <img
                      className="w-12 h-12 rounded-full shadow-md object-cover flex-shrink-0"
                      src={report.avatar}
                      alt={report.username}
                      style={{marginLeft: 10, marginTop: 10}}
                    />
                    <div className="text-black text-base font-semibold font-['Afacad'] truncate" style={{marginTop: 15}}>
                      {report.username}
                    </div>
                  </div>

                  {/* Middle: Title and Content Snippet - PRESERVING INLINE STYLE */}
                  <div className="px-4 flex flex-col justify-start items-start gap-1 overflow-hidden flex-1" style={{marginTop: 5, marginLeft: 15}}>
                    <div className="text-black text-base font-extrabold font-['Afacad'] leading-snug w-full">
                      {report.title}
                    </div>
                    <div className="text-black text-xs font-normal font-['Afacad'] line-clamp-2">
                      {report.content}
                    </div>
                  </div>

                  {/* Bottom: Date, Status, and Action Button - PRESERVING INLINE STYLE */}
                  <div className="p-3 pt-1 flex justify-between items-center" style={{marginLeft: 10}}>
                    <div className="text-neutral-500 text-xs font-normal font-['Afacad']">
                      {report.date}
                    </div>
        
                      {/* Reply Button (Action) */}
                      <button
                        className="w-6 h-6 p-1 bg-[#6BC4A6] rounded-full flex justify-center items-center cursor-pointer hover:bg-[#005236] transition-colors flex-shrink-0" 
                        style={{marginRight: 10, marginBottom: 5}}
                        title="Reply"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(report);
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

      {/* Report Reply Modal */}
      <Repreplymodal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        report={selectedReport}
        onReplySubmit={handleReplySubmit}
      />
    </div>
  );
}