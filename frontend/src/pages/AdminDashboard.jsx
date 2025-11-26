import React from "react";
import SidebarLogoAdmin from "../components/SidebarLogoAdmin";
import { User } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="w-full h-screen flex bg-gray-50">
      {/* Admin Sidebar */}
      <SidebarLogoAdmin />

      {/* Main content area */}
      <div className="flex-1 ml-0 lg:ml-48 flex flex-col h-screen min-w-0">
        <main className="flex-1 overflow-y-auto w-full max-w-full overflow-x-hidden">
          <div className="w-full px-3 sm:px-5 md:px-6 lg:px-8 inline-flex flex-col justify-start items-start gap-6 sm:gap-8 md:gap-10 py-4 sm:py-6">
            <div className="self-stretch flex flex-col justify-start items-start gap-4 sm:gap-6 md:gap-8">
              <div className="self-stretch flex flex-col sm:flex-row justify-center items-c gap-4 sm:gap-6">
                <div className="w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 bg-[#6BC4A6]/100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="flex flex-col items-center justify-center text-center text-zinc-100 text-2xl sm:text-3xl md:text-5xl font-bold font-['Poppins'] px-2">
                    <div>Site</div>
                    <div>Stats</div>
                  </div>
                </div>
                <div className="w-full sm:w-3/4 md:w-2/3 lg:w-auto lg:flex-1 max-w-2xl p-3 sm:p-4 py-4 sm:py-6 bg-[#6BC4A6]/40 rounded-2xl sm:rounded-[34.62px] flex justify-center items-center gap-3 sm:gap-4 md:gap-5 flex-wrap sm:flex-nowrap overflow-x-auto min-h-[160px] sm:min-h-[180px]">
                  <div data-property-1="Visit Count" className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 flex-shrink-0 relative">
                    <div className="w-full h-full left-0 top-0 absolute bg-[#FFFFFF] rounded-lg shadow-[0px_8.656036376953125px_25.968109130859375px_0px_rgba(0,0,0,0.25)]" />
                    <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 left-1/2 top-4 -translate-x-1/2 absolute">
                      <div className="w-full h-full left-0 top-0 absolute bg-blue-green rounded" />
                    </div>
                    <div className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 absolute text-center text-black text-xl sm:text-2xl md:text-3xl font-bold font-['Poppins']">800+</div>
                    <div className="left-1/2 bottom-2 -translate-x-1/2 absolute text-center text-green text-xs font-bold font-['Plus_Jakarta_Sans']">Site Visits</div>
                  </div>
                  <div data-property-1="New Users Count" className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 flex-shrink-0 relative">
                    <div className="w-full h-full left-0 top-0 absolute bg-[#FFFFFF] rounded-lg shadow-[0px_8.656036376953125px_25.968109130859375px_0px_rgba(0,0,0,0.25)]" />
                    <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 left-1/2 top-3 -translate-x-1/2 absolute">
                      <div className="w-full h-3/4 left-0 top-1/4 absolute bg-blue-green rounded" />
                    </div>
                    <div className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 absolute text-center text-black text-xl sm:text-2xl md:text-3xl font-bold font-['Poppins']">50+</div>
                    <div className="left-1/2 bottom-2 -translate-x-1/2 absolute text-center text-green text-xs font-bold font-['Plus_Jakarta_Sans']">New Users</div>
                  </div>
                  <div data-property-1="Active Users Count" className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 flex-shrink-0 relative">
                    <div className="w-full h-full left-0 top-0 absolute bg-[#FFFFFF] rounded-lg shadow-[0px_8.656036376953125px_25.968109130859375px_0px_rgba(0,0,0,0.25)]" />
                    <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 left-1/2 top-3 -translate-x-1/2 absolute">
                      <div className="w-3/4 h-3/4 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 absolute bg-blue-green rounded" />
                    </div>
                    <div className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 absolute text-center text-black text-xl sm:text-2xl md:text-3xl font-bold font-['Poppins']">4K+</div>
                    <div className="left-1/2 bottom-2 -translate-x-1/2 absolute text-center text-green text-xs font-bold font-['Plus_Jakarta_Sans']">Active Users</div>
                  </div>
                  <div data-property-1="Recipe Count" className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 flex-shrink-0 relative">
                    <div className="w-full h-full left-0 top-0 absolute bg-[#FFFFFF] rounded-lg shadow-[0px_8.656036376953125px_25.968109130859375px_0px_rgba(0,0,0,0.25)]" />
                    <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 left-1/2 top-3 -translate-x-1/2 absolute">
                      <div className="w-2/3 h-full left-1/2 top-0 -translate-x-1/2 absolute bg-blue-green rounded" />
                    </div>
                    <div className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 absolute text-center text-black text-xl sm:text-2xl md:text-3xl font-bold font-['Poppins']">1M+</div>
                    <div className="left-1/2 bottom-2 -translate-x-1/2 absolute text-center text-green text-xs font-bold font-['Plus_Jakarta_Sans']">Recipes Posted</div>
                  </div>
                </div>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-3 sm:gap-4">
                <div className="self-stretch flex flex-col lg:flex-row justify-start items-center lg:items-start gap-4 sm:gap-6">
                  <div className="w-full lg:flex-1 p-3 sm:p-4 bg-gradient-to-l from-[#6BC4A6] to-[#FFE8CD] rounded-2xl sm:rounded-[36.96px] flex justify-center items-start gap-3 sm:gap-4 overflow-x-auto">
                    <div className="w-32 sm:w-36 md:w-40 flex-shrink-0 flex flex-col gap-1.5 sm:gap-2">
                      <div className="w-full aspect-square relative rounded-xl sm:rounded-2xl overflow-hidden">
                        <img className="w-full h-full object-cover" src="https://placehold.co/451x321" />
                      </div>
                      <div className="text-center text-black text-sm sm:text-base font-bold font-['Plus_Jakarta_Sans']">BINANGKAL</div>
                      <div className="text-center text-zinc-500 text-xs font-medium font-['Poppins']">512,465 likes  •  1,278 comments</div>
                      <div className="w-full flex justify-center items-center gap-1.5">
                        <User className="w-4 h-4 text-stone-500" />
                        <div className="text-center text-stone-500 text-xs font-['Poppins']">user_name</div>
                      </div>
                    </div>
                    <div className="w-32 sm:w-36 md:w-40 flex-shrink-0 flex flex-col gap-1.5 sm:gap-2">
                      <div className="w-full aspect-square relative rounded-xl sm:rounded-2xl overflow-hidden">
                        <img className="w-full h-full object-cover" src="https://placehold.co/279x296" />
                      </div>
                      <div className="text-center text-black text-sm sm:text-base font-bold font-['Plus_Jakarta_Sans']">SINIGANG</div>
                      <div className="text-center text-zinc-500 text-xs font-medium font-['Poppins']">231,899 likes  •  948 comments</div>
                      <div className="w-full flex justify-center items-center gap-1.5">
                        <User className="w-4 h-4 text-stone-500" />
                        <div className="text-center text-stone-500 text-xs font-['Poppins']">user_name</div>
                      </div>
                    </div>
                    <div className="w-32 sm:w-36 md:w-40 flex-shrink-0 flex flex-col gap-1.5 sm:gap-2">
                      <div className="w-full aspect-square relative rounded-xl sm:rounded-2xl overflow-hidden">
                        <img className="w-full h-full object-cover" src="https://placehold.co/443x295" />
                      </div>
                      <div className="text-center text-black text-sm sm:text-base font-bold font-['Plus_Jakarta_Sans']">KARE-KARE</div>
                      <div className="text-center text-zinc-500 text-xs font-medium font-['Poppins']">100,354 likes  •  521 comments</div>
                      <div className="w-full flex justify-center items-center gap-1.5">
                        <User className="w-4 h-4 text-stone-500" />
                        <div className="text-center text-stone-500 text-xs font-['Poppins']">user_name</div>
                      </div>
                    </div>
                    <div className="w-32 sm:w-36 md:w-40 flex-shrink-0 flex flex-col gap-1.5 sm:gap-2">
                      <div className="w-full aspect-square relative rounded-xl sm:rounded-2xl overflow-hidden">
                        <img className="w-full h-full object-cover" src="https://placehold.co/442x294" />
                      </div>
                      <div className="text-center text-black text-base font-bold font-['Plus_Jakarta_Sans']">ADOBO</div>
                      <div className="text-center text-zinc-500 text-xs font-medium font-['Poppins']">465,266 likes  •  1,004 comments</div>
                      <div className="w-full flex justify-center items-center gap-1.5">
                        <User className="w-4 h-4 text-stone-500" />
                        <div className="text-center text-stone-500 text-xs font-['Poppins']">user_name</div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full max-w-[280px] md:max-w-[300px] lg:w-48 mx-auto lg:mx-0 bg-gradient-to-b from-orange-400/5 to-orange-100/25 rounded-2xl sm:rounded-[34.62px] flex flex-col justify-start items-start">
                    <div className="w-full h-16 sm:h-20 px-2 inline-flex justify-start items-center gap-2 sm:gap-3">
                      <img className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 shadow-[0px_3.462414503097534px_3.462414503097534px_0px_rgba(0,0,0,0.25)] rounded-full object-cover flex-shrink-0" src="https://placehold.co/65x62" />
                      <div className="flex-1 min-w-0 h-12 sm:h-14 inline-flex flex-col justify-between items-start">
                        <div className="w-full h-4 text-left text-black text-sm sm:text-base md:text-xl font-normal font-['Afacad'] truncate">_username001</div>
                        <div className="w-24 py-1.5 inline-flex justify-between items-center">
                          <div className="text-center justify-center text-black text-sm font-semibold font-['Sarabun']">1M</div>
                          <div className="w-12 h-2.5 text-center justify-center text-black text-sm font-normal font-['Afacad']">followers</div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-16 sm:h-20 px-2 inline-flex justify-start items-center gap-2 sm:gap-3">
                      <img className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 shadow-[0px_3.462414503097534px_3.462414503097534px_0px_rgba(0,0,0,0.25)] rounded-full object-cover flex-shrink-0" src="https://placehold.co/65x62" />
                      <div className="flex-1 min-w-0 h-12 inline-flex flex-col justify-between items-start">
                        <div className="w-full h-4 text-left text-black text-sm font-normal font-['Afacad'] truncate">_username001</div>
                        <div className="w-24 py-1.5 inline-flex justify-between items-center">
                          <div className="text-center justify-center text-black text-sm font-semibold font-['Sarabun']">1M</div>
                          <div className="w-12 h-2.5 text-center justify-center text-black text-sm font-normal font-['Afacad']">followers</div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-16 sm:h-20 px-2 inline-flex justify-start items-center gap-2 sm:gap-3">
                      <img className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 shadow-[0px_3.462414503097534px_3.462414503097534px_0px_rgba(0,0,0,0.25)] rounded-full object-cover flex-shrink-0" src="https://placehold.co/65x62" />
                      <div className="flex-1 min-w-0 h-12 inline-flex flex-col justify-between items-start">
                        <div className="w-full h-4 text-left text-black text-sm font-normal font-['Afacad'] truncate">_username001</div>
                        <div className="w-24 py-1.5 inline-flex justify-between items-center">
                          <div className="text-center justify-center text-black text-sm font-semibold font-['Sarabun']">1M</div>
                          <div className="w-12 h-2.5 text-center justify-center text-black text-sm font-normal font-['Afacad']">followers</div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-16 sm:h-20 px-2 inline-flex justify-start items-center gap-2 sm:gap-3">
                      <img className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 shadow-[0px_3.462414503097534px_3.462414503097534px_0px_rgba(0,0,0,0.25)] rounded-full object-cover flex-shrink-0" src="https://placehold.co/65x62" />
                      <div className="flex-1 min-w-0 h-12 inline-flex flex-col justify-between items-start">
                        <div className="w-full h-4 text-left text-black text-sm font-normal font-['Afacad'] truncate">_username001</div>
                        <div className="w-24 py-1.5 inline-flex justify-between items-center">
                          <div className="text-center justify-center text-black text-sm font-semibold font-['Sarabun']">1M</div>
                          <div className="w-12 h-2.5 text-center justify-center text-black text-sm font-normal font-['Afacad']">followers</div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-16 sm:h-20 px-2 inline-flex justify-start items-center gap-2 sm:gap-3">
                      <img className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 shadow-[0px_3.462414503097534px_3.462414503097534px_0px_rgba(0,0,0,0.25)] rounded-full object-cover flex-shrink-0" src="https://placehold.co/65x62" />
                      <div className="flex-1 min-w-0 h-12 inline-flex flex-col justify-between items-start">
                        <div className="w-full h-4 text-left text-black text-sm font-normal font-['Afacad'] truncate">_username001</div>
                        <div className="w-24 py-1.5 inline-flex justify-between items-center">
                          <div className="text-center justify-center text-black text-sm font-semibold font-['Sarabun']">1M</div>
                          <div className="w-12 h-2.5 text-center justify-center text-black text-sm font-normal font-['Afacad']">followers</div>
                        </div>
                      </div>
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

