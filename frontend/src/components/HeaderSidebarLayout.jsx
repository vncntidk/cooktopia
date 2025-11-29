import React from "react";
import Header from "./Header/Header";
import Sidebar from "./Sidebar/Sidebar";

export default function HeaderSidebarLayout({ children }) {
  return (
    <div className="w-full h-screen flex bg-gray-50 overflow-hidden">
      
      {/* Sidebar - Fixed on the right */}
      <div className="fixed right-0 top-0 z-40">
        <Sidebar />
      </div>

      {/* Main content with header */}
      <div className="flex-1 flex flex-col h-full mr-16 overflow-hidden">
        {/* Header - Fixed at top, accounting for right sidebar */}
        <div className="fixed left-0 top-0 right-16 h-16 bg-white z-30">
          <Header />
        </div>

        {/* Main content area - Scrollable, accounting for header and sidebar */}
        <main className="flex-1 mt-16 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
