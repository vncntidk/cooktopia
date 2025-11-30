import React, { useState, useEffect, useRef } from "react";
import SidebarLogoAdmin from "../components/SidebarLogoAdmin";
import SearchBarUser from "../components/SearchBarUser";

export default function AdminActivity() {
  const [searchQuery, setSearchQuery] = useState("");
  
    const inputRef = useRef(null);

    const act = [
      { log: 201, admin: "Gordon Ramsey", action: "Delete Feedback", target: "FeedbackID: 120", timestamp: "01/15/2024 - 09:30 AM", avatar: "https://i.pravatar.cc/150?img=3" },
      { log: 201, admin: "Gordon Ramsey", action: "Banned a User", target: "UserID: 154", timestamp: "03/22/2024 - 02:15 PM", avatar: "https://i.pravatar.cc/150?img=3" },
      { log: 201, admin: "Cook Yeon", action: "Delete Feedback", target: "FeedbackID: 149", timestamp: "05/08/2024 - 11:45 AM", avatar: "https://i.pravatar.cc/150?img=25" },
      { log: 201, admin: "Judy Ann Santos", action: "Flagged a Post Inappropriate", target: "PostID: 267", timestamp: "07/12/2024 - 04:20 PM", avatar: "https://i.pravatar.cc/150?img=48" },
      { log: 201, admin: "Cook Yeon", action: "Banned a User", target: "UserID: 123", timestamp: "02/10/2024 - 10:00 AM", avatar: "https://i.pravatar.cc/150?img=25" },
      { log: 201, admin: "Cook Yeon", action: "Delete Feedback", target: "FeedbackID: 270", timestamp: "09/30/2024 - 08:00 AM", avatar: "https://i.pravatar.cc/150?img=25" },
    ];
  
    // Expanded filtering to include action and target for better search functionality
    const filteredUsers = act.filter((a) =>
      a.admin.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.target.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    // Removed the problematic useEffect/inputRef as it's not needed with the onSearch prop

    return (
      <div className="w-full h-screen flex bg-gray-50">
        <SidebarLogoAdmin />
  
        <div className="flex-1 ml-0 lg:ml-48 flex flex-col h-screen min-w-0 ">

          <div className="self-stretch flex items-center justify-between mt-4 sm:mt-8">
            <h1 className="text-3xl text-center font-bold text-black min-w-[230px]" style={{ paddingLeft: '100px'}}>
              Activity Log
            </h1>

            <div className="w-[80%]"  style={{ padding: '20px', }}>
              <SearchBarUser onSearch={setSearchQuery}/>
            </div>
          </div>
  
          {/* Removed overflow-x-auto from main to ensure the container itself doesn't scroll unnecessarily */}
          <main className="flex-1 overflow-y-auto w-full max-w-full" style={{ paddingTop: '20px' , paddingLeft: '20px', paddingRight: '20px'}}>
            {/* Standardized main padding */}
            <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col justify-start gap-6 sm:gap-8 md:gap-10 py-4 sm:py-6">

              {/* Adjusted container: Removed redundant padding/margin styles */}
              <div className="self-stretch inline-flex flex-col justify-start mt-4 sm:mt-8">
                
                {/* TABLE HEADER */}
                {/* Changes: Removed hardcoded style padding. Used 'w-full' and flex-1 on columns for full width. */}
                <div className="flex items-center h-20 font-medium text-black px-5">
                  <div className="flex items-center w-full text-black px-5">
                    
                    {/* Replaced fixed widths with flex-1 for dynamic sizing */}
                    <div className="flex-1 text-left text-sm sm:text-base md:text-lg font-['Poppins'] min-w-[120px]">Timestamp</div>
                    <div className="flex-1 text-left text-sm sm:text-base md:text-lg font-['Poppins'] min-w-[150px]">Admin Name</div>
                    <div className="flex-1 text-left text-sm sm:text-base md:text-lg font-['Poppins'] min-w-[100px]">Action</div>
                    <div className="flex-1 text-left text-sm sm:text-base md:text-lg font-['Poppins'] min-w-[100px]">Target</div>
                    <div className="w-16 text-center text-sm sm:text-base md:text-lg font-['Poppins']">Log ID</div>
                  </div>
                </div>
                
                {/* USER LIST */}
                {/* Removed hardcoded style padding */}
                <div className="flex flex-col">
  
                  {/* No result found */}
                  {filteredUsers.length === 0 && (
                    <div className="text-center text-gray-500 text-lg py-5">
                      No matching result
                    </div>
                  )}
  
                  {filteredUsers.map((user, index) => (
                    <div
                      key={index}
                      className={`
                        self-stretch w-full h-[50px] flex 
                        ${index % 2 === 0 ? "bg-[#DFF1EB]" : "bg-white"}
                        hover:bg-[#c9edd3] transition
                      ` }
                    >
                      {/* Row Content: Used 'w-full' and 'px-10' for standardized padding */}
                      <div className="flex items-center w-full gap-3 font-semibold text-blacks px-10">
                        
                        {/* Timestamp: Replaced fixed width and large margin with flex-1 and min-width */}
                        <div className="flex-1 text-left text-xs sm:text-sm font-medium font-['Poppins'] min-w-[120px]">{user.timestamp}</div>
                        
                        {/* Admin Name: Replaced fixed width with flex-1 */}
                        <div className="flex-1 flex items-center gap-3 min-w-[150px]">
                          <img
                            className="w-9 h-9 rounded-full object-cover"
                            src={user.avatar}
                            alt="Admin avatar"
                          />
                          <span className="text-xs sm:text-sm font-medium font-['Poppins']">{user.admin}</span>
                        </div>
                        
                        {/* Action: Replaced fixed width with flex-1 */}
                        <div className="flex-1 text-left text-xs sm:text-sm font-medium font-['Poppins'] min-w-[100px]">{user.action}</div>
                        
                        {/* Target: Replaced fixed width with flex-1 */}
                        <div className="flex-1 text-left text-xs sm:text-sm font-medium font-['Poppins'] min-w-[100px]">{user.target}</div>
                        
                        {/* Log ID: Set a small fixed width as it's a short value, ensuring it doesn't take too much space */}
                        <div className="w-16 text-center text-xs sm:text-sm font-semibold font-['Poppins']">{user.log}</div>
                      </div>
                    </div>
                  ))}
                </div>
  
              </div>
            </div>
          </main>
        </div>
      </div>
    );
}