import React from "react";
import SidebarLogoAdmin from "../components/SidebarLogoAdmin";
import SearchBarUser from "../components/SearchBarUser";

export default function AdminUser() {
  return (
    <div className="w-full h-screen flex bg-gray-50">
      {/* Admin Sidebar */}
      <SidebarLogoAdmin />

      {/* Main content area */}
      <div className="flex-1 ml-0 lg:ml-48 flex flex-col h-screen min-w-0">
        <main className="flex-1 overflow-y-auto w-full max-w-full overflow-x-hidden">
          <div className="w-full px-3 sm:px-5 md:px-6 lg:px-8 inline-flex flex-col justify-start items-start gap-6 sm:gap-8 md:gap-10 py-4 sm:py-6">
            <div className="self-stretch flex justify-center items-center mt-8 sm:mt-12 md:mt-16">
              <SearchBarUser />
            </div>
            
            <div className="self-stretch px-3 sm:px-7 inline-flex flex-col justify-start items-start gap-6 sm:gap-10 mt-6 sm:mt-8">
              {/* Table Header */}
              <div className="self-stretch h-12 sm:h-16 inline-flex justify-start items-start gap-8 sm:gap-14 overflow-x-auto">
                <div className="flex-1 min-w-[120px] text-center justify-start text-black text-sm sm:text-base md:text-lg font-normal font-['Poppins']">
                  Username
                </div>
                <div className="flex-1 min-w-[200px] text-center justify-start text-black text-sm sm:text-base md:text-lg font-normal font-['Poppins']">
                  Email
                </div>
                <div className="flex-1 min-w-[150px] text-center justify-end text-black text-sm sm:text-base md:text-lg font-normal font-['Poppins']">
                  Number of Posts
                </div>
                <div className="flex-1 min-w-[180px] text-center justify-end text-black text-sm sm:text-base md:text-lg font-normal font-['Poppins']">
                  Account Created
                </div>
              </div>

              {/* User Rows */}
              <div className="self-stretch flex flex-col justify-start items-start gap-4 sm:gap-6">
                {/* User Row 1 */}
                <div className="self-stretch inline-flex justify-start items-center gap-3 sm:gap-3.5 overflow-x-auto">
                  <img 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex-shrink-0" 
                    src="https://placehold.co/50x50" 
                    alt="User avatar"
                  />
                  <div className="flex-1 min-w-[120px] p-2.5 flex justify-start items-center gap-1.5">
                    <div className="flex-1 justify-start text-black text-sm sm:text-base font-normal font-['Poppins']">
                      username_123
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px] p-2.5 flex justify-center items-center gap-1.5">
                    <div className="flex-1 text-center justify-start text-black text-sm sm:text-base font-normal font-['Poppins'] underline">
                      username_123@gmail.com
                    </div>
                  </div>
                  <div className="flex-1 min-w-[150px] p-2.5 flex justify-center items-center gap-1.5">
                    <div className="flex-1 text-center justify-start text-black text-sm sm:text-base font-normal font-['Poppins']">
                      10
                    </div>
                  </div>
                  <div className="flex-1 min-w-[180px] p-2.5 flex justify-center items-center gap-1.5">
                    <div className="flex-1 text-center justify-start text-black text-xs sm:text-sm font-medium font-['Poppins']">
                      01/15/2024 09:30 AM
                    </div>
                  </div>
                </div>

                {/* User Row 2 */}
                <div className="self-stretch inline-flex justify-start items-center gap-3 sm:gap-3.5 overflow-x-auto">
                  <img 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex-shrink-0" 
                    src="https://placehold.co/50x50" 
                    alt="User avatar"
                  />
                  <div className="flex-1 min-w-[120px] p-2.5 flex justify-start items-center gap-1.5">
                    <div className="flex-1 justify-start text-black text-sm sm:text-base font-normal font-['Poppins']">
                      username_123
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px] p-2.5 flex justify-center items-center gap-1.5">
                    <div className="flex-1 text-center justify-start text-black text-sm sm:text-base font-normal font-['Poppins'] underline">
                      username_123@gmail.com
                    </div>
                  </div>
                  <div className="flex-1 min-w-[150px] p-2.5 flex justify-center items-center gap-1.5">
                    <div className="flex-1 text-center justify-start text-black text-sm sm:text-base font-normal font-['Poppins']">
                      10
                    </div>
                  </div>
                  <div className="flex-1 min-w-[180px] p-2.5 flex justify-center items-center gap-1.5">
                    <div className="flex-1 text-center justify-start text-black text-xs sm:text-sm font-medium font-['Poppins']">
                      03/22/2024 02:15 PM
                    </div>
                  </div>
                </div>

                {/* User Row 3 */}
                <div className="self-stretch inline-flex justify-start items-center gap-3 sm:gap-3.5 overflow-x-auto">
                  <img 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex-shrink-0" 
                    src="https://placehold.co/50x50" 
                    alt="User avatar"
                  />
                  <div className="flex-1 min-w-[120px] p-2.5 flex justify-start items-center gap-1.5">
                    <div className="flex-1 justify-start text-black text-sm sm:text-base font-normal font-['Poppins']">
                      username_123
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px] p-2.5 flex justify-center items-center gap-1.5">
                    <div className="flex-1 text-center justify-start text-black text-sm sm:text-base font-normal font-['Poppins'] underline">
                      username_123@gmail.com
                    </div>
                  </div>
                  <div className="flex-1 min-w-[150px] p-2.5 flex justify-center items-center gap-1.5">
                    <div className="flex-1 text-center justify-start text-black text-sm sm:text-base font-normal font-['Poppins']">
                      10
                    </div>
                  </div>
                  <div className="flex-1 min-w-[180px] p-2.5 flex justify-center items-center gap-1.5">
                    <div className="flex-1 text-center justify-start text-black text-xs sm:text-sm font-medium font-['Poppins']">
                      05/08/2024 11:45 AM
                    </div>
                  </div>
                </div>

                {/* User Row 4 */}
                <div className="self-stretch inline-flex justify-start items-center gap-3 sm:gap-3.5 overflow-x-auto">
                  <img 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex-shrink-0" 
                    src="https://placehold.co/50x50" 
                    alt="User avatar"
                  />
                  <div className="flex-1 min-w-[120px] p-2.5 flex justify-start items-center gap-1.5">
                    <div className="flex-1 justify-start text-black text-sm sm:text-base font-normal font-['Poppins']">
                      username_123
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px] p-2.5 flex justify-center items-center gap-1.5">
                    <div className="flex-1 text-center justify-start text-black text-sm sm:text-base font-normal font-['Poppins'] underline">
                      username_123@gmail.com
                    </div>
                  </div>
                  <div className="flex-1 min-w-[150px] p-2.5 flex justify-center items-center gap-1.5">
                    <div className="flex-1 text-center justify-start text-black text-sm sm:text-base font-normal font-['Poppins']">
                      10
                    </div>
                  </div>
                  <div className="flex-1 min-w-[180px] p-2.5 flex justify-center items-center gap-1.5">
                    <div className="flex-1 text-center justify-start text-black text-xs sm:text-sm font-medium font-['Poppins']">
                      07/12/2024 04:20 PM
                    </div>
                  </div>
                </div>

                {/* User Row 5 */}
                <div className="self-stretch inline-flex justify-start items-center gap-3 sm:gap-3.5 overflow-x-auto">
                  <img 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex-shrink-0" 
                    src="https://placehold.co/50x50" 
                    alt="User avatar"
                  />
                  <div className="flex-1 min-w-[120px] p-2.5 flex justify-start items-center gap-1.5">
                    <div className="flex-1 justify-start text-black text-sm sm:text-base font-normal font-['Poppins']">
                      username_123
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px] p-2.5 flex justify-center items-center gap-1.5">
                    <div className="flex-1 text-center justify-start text-black text-sm sm:text-base font-normal font-['Poppins'] underline">
                      username_123@gmail.com
                    </div>
                  </div>
                  <div className="flex-1 min-w-[150px] p-2.5 flex justify-center items-center gap-1.5">
                    <div className="flex-1 text-center justify-start text-black text-sm sm:text-base font-normal font-['Poppins']">
                      10
                    </div>
                  </div>
                  <div className="flex-1 min-w-[180px] p-2.5 flex justify-center items-center gap-1.5">
                    <div className="flex-1 text-center justify-start text-black text-xs sm:text-sm font-medium font-['Poppins']">
                      07/10/2025 10:00 AM
                    </div>
                  </div>
                </div>

                {/* User Row 6 */}
                <div className="self-stretch inline-flex justify-start items-center gap-3 sm:gap-3.5 overflow-x-auto">
                  <img 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex-shrink-0" 
                    src="https://placehold.co/50x50" 
                    alt="User avatar"
                  />
                  <div className="flex-1 min-w-[120px] p-2.5 flex justify-start items-center gap-1.5">
                    <div className="flex-1 justify-start text-black text-sm sm:text-base font-normal font-['Poppins']">
                      username_123
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px] p-2.5 flex justify-center items-center gap-1.5">
                    <div className="flex-1 text-center justify-start text-black text-sm sm:text-base font-normal font-['Poppins'] underline">
                      username_123@gmail.com
                    </div>
                  </div>
                  <div className="flex-1 min-w-[150px] p-2.5 flex justify-center items-center gap-1.5">
                    <div className="flex-1 text-center justify-start text-black text-sm sm:text-base font-normal font-['Poppins']">
                      10
                    </div>
                  </div>
                  <div className="flex-1 min-w-[180px] p-2.5 flex justify-center items-center gap-1.5">
                    <div className="flex-1 text-center justify-start text-black text-xs sm:text-sm font-medium font-['Poppins']">
                      09/30/2024 08:00 AM
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

