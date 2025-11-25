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
            <div className="self-stretch flex justify-center items-center mt-8 sm:mt-12 md:mt-16" style={{ paddingTop: '20px' }}>
              <SearchBarUser />
            </div>
            
            <div className="self-stretch px-3 sm:px-7 inline-flex flex-col justify-start items-start gap-3 sm:gap-4 mt-6 sm:mt-8">
              {/* Table Header */}
              <div className="self-stretch h-12 sm:h-16 inline-flex justify-start items-center gap-3 sm:gap-3.5 overflow-x-auto" style={{ paddingLeft: '20px' }}>
                <div className="w-10 sm:w-12 flex-shrink-0"></div>
                <div className="flex-1 min-w-[120px] text-center text-black text-sm sm:text-base md:text-lg font-normal font-['Poppins']">
                  Username
                </div>
                <div className="flex-1 min-w-[200px] text-center text-black text-sm sm:text-base md:text-lg font-normal font-['Poppins']">
                  Email
                </div>
                <div className="flex-1 min-w-[150px] text-center text-black text-sm sm:text-base md:text-lg font-normal font-['Poppins']">
                  Number of Posts
                </div>
                <div className="flex-1 min-w-[180px] text-center text-black text-sm sm:text-base md:text-lg font-normal font-['Poppins']">
                  Account Created
                </div>
              </div>

              {/* User Rows */}
              <div className="self-stretch flex flex-col justify-start items-start gap-4 sm:gap-6" style={{ paddingLeft: '20px' }}>
                {/* User Row 1 */}
                <div className="self-stretch inline-flex justify-start items-center gap-3 sm:gap-3.5 overflow-x-auto pl-3 sm:pl-5">
                  <img 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0" 
                    src="https://i.pravatar.cc/150?img=1" 
                    alt="User avatar"
                  />
                  <div className="flex-1 min-w-[120px] p-2.5 flex justify-center items-center">
                    <div className="text-center text-black text-sm sm:text-base font-normal font-['Poppins']">
                      chef_maria
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px] p-2.5 flex justify-center items-center">
                    <div className="text-center text-black text-sm sm:text-base font-normal font-['Poppins'] underline">
                      maria.santos@gmail.com
                    </div>
                  </div>
                  <div className="flex-1 min-w-[150px] p-2.5 flex justify-center items-center">
                    <div className="text-center text-black text-sm sm:text-base font-normal font-['Poppins']">
                      24
                    </div>
                  </div>
                  <div className="flex-1 min-w-[180px] p-2.5 flex justify-center items-center">
                    <div className="text-center text-black text-xs sm:text-sm font-medium font-['Poppins']">
                      01/15/2024 09:30 AM
                    </div>
                  </div>
                </div>

                {/* User Row 2 */}
                <div className="self-stretch inline-flex justify-start items-center gap-3 sm:gap-3.5 overflow-x-auto pl-3 sm:pl-5">
                  <img 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0" 
                    src="https://i.pravatar.cc/150?img=12" 
                    alt="User avatar"
                  />
                  <div className="flex-1 min-w-[120px] p-2.5 flex justify-center items-center">
                    <div className="text-center text-black text-sm sm:text-base font-normal font-['Poppins']">
                      john_foodie
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px] p-2.5 flex justify-center items-center">
                    <div className="text-center text-black text-sm sm:text-base font-normal font-['Poppins'] underline">
                      john.doe@yahoo.com
                    </div>
                  </div>
                  <div className="flex-1 min-w-[150px] p-2.5 flex justify-center items-center">
                    <div className="text-center text-black text-sm sm:text-base font-normal font-['Poppins']">
                      7
                    </div>
                  </div>
                  <div className="flex-1 min-w-[180px] p-2.5 flex justify-center items-center">
                    <div className="text-center text-black text-xs sm:text-sm font-medium font-['Poppins']">
                      03/22/2024 02:15 PM
                    </div>
                  </div>
                </div>

                {/* User Row 3 */}
                <div className="self-stretch inline-flex justify-start items-center gap-3 sm:gap-3.5 overflow-x-auto pl-3 sm:pl-5">
                  <img 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0" 
                    src="https://i.pravatar.cc/150?img=5" 
                    alt="User avatar"
                  />
                  <div className="flex-1 min-w-[120px] p-2.5 flex justify-center items-center">
                    <div className="text-center text-black text-sm sm:text-base font-normal font-['Poppins']">
                      sarah_cooks
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px] p-2.5 flex justify-center items-center">
                    <div className="text-center text-black text-sm sm:text-base font-normal font-['Poppins'] underline">
                      sarah.lee@outlook.com
                    </div>
                  </div>
                  <div className="flex-1 min-w-[150px] p-2.5 flex justify-center items-center">
                    <div className="text-center text-black text-sm sm:text-base font-normal font-['Poppins']">
                      32
                    </div>
                  </div>
                  <div className="flex-1 min-w-[180px] p-2.5 flex justify-center items-center">
                    <div className="text-center text-black text-xs sm:text-sm font-medium font-['Poppins']">
                      05/08/2024 11:45 AM
                    </div>
                  </div>
                </div>

                {/* User Row 4 */}
                <div className="self-stretch inline-flex justify-start items-center gap-3 sm:gap-3.5 overflow-x-auto pl-3 sm:pl-5">
                  <img 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0" 
                    src="https://i.pravatar.cc/150?img=33" 
                    alt="User avatar"
                  />
                  <div className="flex-1 min-w-[120px] p-2.5 flex justify-center items-center">
                    <div className="text-center text-black text-sm sm:text-base font-normal font-['Poppins']">
                      mike_baker
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px] p-2.5 flex justify-center items-center">
                    <div className="text-center text-black text-sm sm:text-base font-normal font-['Poppins'] underline">
                      mike.brown@gmail.com
                    </div>
                  </div>
                  <div className="flex-1 min-w-[150px] p-2.5 flex justify-center items-center">
                    <div className="text-center text-black text-sm sm:text-base font-normal font-['Poppins']">
                      15
                    </div>
                  </div>
                  <div className="flex-1 min-w-[180px] p-2.5 flex justify-center items-center">
                    <div className="text-center text-black text-xs sm:text-sm font-medium font-['Poppins']">
                      07/12/2024 04:20 PM
                    </div>
                  </div>
                </div>

                {/* User Row 5 */}
                <div className="self-stretch inline-flex justify-start items-center gap-3 sm:gap-3.5 overflow-x-auto pl-3 sm:pl-5">
                  <img 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0" 
                    src="https://i.pravatar.cc/150?img=47" 
                    alt="User avatar"
                  />
                  <div className="flex-1 min-w-[120px] p-2.5 flex justify-center items-center">
                    <div className="text-center text-black text-sm sm:text-base font-normal font-['Poppins']">
                      anna_recipes
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px] p-2.5 flex justify-center items-center">
                    <div className="text-center text-black text-sm sm:text-base font-normal font-['Poppins'] underline">
                      anna.garcia@hotmail.com
                    </div>
                  </div>
                  <div className="flex-1 min-w-[150px] p-2.5 flex justify-center items-center">
                    <div className="text-center text-black text-sm sm:text-base font-normal font-['Poppins']">
                      41
                    </div>
                  </div>
                  <div className="flex-1 min-w-[180px] p-2.5 flex justify-center items-center">
                    <div className="text-center text-black text-xs sm:text-sm font-medium font-['Poppins']">
                      02/10/2024 10:00 AM
                    </div>
                  </div>
                </div>

                {/* User Row 6 */}
                <div className="self-stretch inline-flex justify-start items-center gap-3 sm:gap-3.5 overflow-x-auto pl-3 sm:pl-5">
                  <img 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0" 
                    src="https://i.pravatar.cc/150?img=68" 
                    alt="User avatar"
                  />
                  <div className="flex-1 min-w-[120px] p-2.5 flex justify-center items-center">
                    <div className="text-center text-black text-sm sm:text-base font-normal font-['Poppins']">
                      david_meals
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px] p-2.5 flex justify-center items-center">
                    <div className="text-center text-black text-sm sm:text-base font-normal font-['Poppins'] underline">
                      david.kim@gmail.com
                    </div>
                  </div>
                  <div className="flex-1 min-w-[150px] p-2.5 flex justify-center items-center">
                    <div className="text-center text-black text-sm sm:text-base font-normal font-['Poppins']">
                      18
                    </div>
                  </div>
                  <div className="flex-1 min-w-[180px] p-2.5 flex justify-center items-center">
                    <div className="text-center text-black text-xs sm:text-sm font-medium font-['Poppins']">
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

