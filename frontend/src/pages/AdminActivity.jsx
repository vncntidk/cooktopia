import React from "react";
import SidebarLogoAdmin from "../components/SidebarLogoAdmin";

export default function AdminActivity() {
  return (
    <div className="w-full h-screen flex bg-gray-50">
      {/* Admin Sidebar */}
      <SidebarLogoAdmin />

      {/* Main content area */}
      <div className="flex-1 ml-0 lg:ml-48 flex flex-col h-screen min-w-0">
        <main className="flex-1 overflow-y-auto w-full max-w-full overflow-x-hidden">
          <div className="w-full px-3 sm:px-5 md:px-6 lg:px-8 inline-flex flex-col justify-start items-start gap-6 sm:gap-8 md:gap-10 py-4 sm:py-6">
            <div className="self-stretch">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-['Poppins'] text-black">
                Activity
              </h1>
            </div>
            <div className="self-stretch">
              <p className="text-gray-600 font-['Poppins']">
                Activity logs and monitoring content will go here.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

