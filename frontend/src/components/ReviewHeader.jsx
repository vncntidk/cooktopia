import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Filter } from "lucide-react";

export default function ReviewHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isFeedbackActive = location.pathname.includes("/admin/reviews/feedback") || location.pathname === "/admin/reviews";
  const isReportActive = location.pathname.includes("/admin/reviews/report");

  const handleFeedbackClick = () => {
    navigate("/admin/reviews/feedback");
  };

  const handleReportClick = () => {
    navigate("/admin/reviews/report");
  };

  return (
    <div className="self-stretch inline-flex justify-start items-center flex-wrap content-center">
      <div className="p-2.5 flex justify-start items-center gap-3.5 flex-wrap content-center">
        <div 
          onClick={handleFeedbackClick}
          className={`w-40 h-9 relative overflow-hidden cursor-pointer ${
            isFeedbackActive ? "border-b border-cyan-800" : ""
          }`}
        >
          <div className={`left-4 top-1 absolute text-center justify-start text-base font-['Poppins'] ${
            isFeedbackActive ? "text-black font-bold" : "text-black font-normal"
          }`}>Feedbacks</div>
        </div>
        <div 
          onClick={handleReportClick}
          className={`w-40 h-9 relative cursor-pointer ${
            isReportActive ? "border-b border-cyan-800" : ""
          }`}
        >
          <div className={`left-4 top-1 absolute text-center justify-start text-base font-['Poppins'] ${
            isReportActive ? "text-black font-bold" : "text-black font-normal"
          }`}>Reports</div>
        </div>
      </div>
      <div className="flex-1 min-w-[500px] p-2.5 flex justify-start items-start gap-2.5">
        <div data-property-1="Default" className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl h-10 sm:h-12 px-3 sm:px-4 py-2 bg-zinc-300/40 rounded-xl flex justify-between items-center gap-2 sm:gap-3">
          <div className="flex-1 flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <div className="justify-start text-black/30 text-sm sm:text-base font-medium font-['Plus_Jakarta_Sans']">Search feedback & reports</div>
          </div>
          <button className="p-2 hover:bg-zinc-400/30 rounded-lg transition-colors">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

