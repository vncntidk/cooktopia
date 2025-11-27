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
  
    const filteredUsers = act.filter((a) =>
      a.admin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.action.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
      useEffect(() => {
      if (!inputRef.current) {
        inputRef.current = document.querySelector("input[placeholder='Search admin']");
      }
  
      if (inputRef.current) {
        inputRef.current.addEventListener("input", (e) => {
          setSearchQuery(e.target.value);
        });
      }
    }, []);
  
    return (
      <div className="w-full h-screen flex bg-gray-50">
        <SidebarLogoAdmin />
  
        <div className="flex-1 ml-0 lg:ml-48 flex flex-col h-screen min-w-0 ">

        <div className="self-stretch flex items-center justify-between mt-4 sm:mt-8" style={{ padding: '10px' }}>
          <h1 className="text-3xl font-bold text-black">
            Activity Log
          </h1>

          <div className="w-[80%]">
            <SearchBarUser />
          </div>
        </div>
  
          <main className="flex-1 overflow-y-auto w-full max-w-full overflow-x-auto">
            <div className="w-full px-5 flex flex-col gap-8">

            <div className="self-stretch px-3 sm:px-7 flex-col justify-start gap-3 sm:gap-4 mt-6 sm:mt-8">
                {/* TABLE HEADER */}
                <div className="flex items-center h-20 font-medium text-black px-5" style={{ paddingLeft: '20px' }}>
                  <div className="flex items-center gap-3 text-black px-5">
                    <div className="w-40 text-center text-sm sm:text-base md:text-lg font-['Poppins']">Timestamp</div>
                    <div className="w-85 text-center text-sm sm:text-base md:text-lg font-['Poppins']">Admin Name</div>
                    <div className="w-60 text-center text-sm sm:text-base md:text-lg font-['Poppins']">Action</div>
                    <div className="w-50 text-center text-sm sm:text-base md:text-lg font-['Poppins']">Target</div>
                    <div className="w-45 text-center text-sm sm:text-base md:text-lg font-['Poppins']">Log ID</div>
                  </div>
              </div>
                
  
                {/* USER LIST */}
                <div className="flex flex-col" style={{ paddingLeft: '20px' }}>
  
                  {/* No result found */}
                  {filteredUsers.length === 0 && (
                    <div className="text-center text-gray-500 text-lg">
                      No matching result
                    </div>
                  )}
  
                  {filteredUsers.map((user, index) => (
                    <div
                      key={index}
                      className={`
                        self-stretch w-max h-[50px] flex
                        ${index % 2 === 0 ? "bg-[#DFF1EB]" : ""}
                        hover:bg-[#c9edd3] transition
                      ` }

                    >
                    <div className="flex items-center gap-5 font-semibold text-blacks" style={{ paddingLeft: '10px' }}>
                      <div className="w-55 ml-40 text-xs sm:text-sm font-medium font-['Poppins']">{user.timestamp}</div>
                      <div className="w-60 flex items-center gap-3">
                        <img
                          className="w-9 h-9 rounded-full object-cover"
                          src={user.avatar}
                          alt="Admin avatar"
                        />
                        <span className="text-xs sm:text-sm font-medium font-['Poppins']">{user.admin}</span>
                      </div>
                      <div className="w-65 text-center text-xs sm:text-sm font-medium font-['Poppins']">{user.action}</div>
                      <div className="w-45 text-center text-xs sm:text-sm font-medium font-['Poppins']">{user.target}</div>
                      <div className="w-45 text-center text-xs sm:text-sm font-semibold font-['Poppins']">{user.log}</div>
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

