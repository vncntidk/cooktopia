import React from "react";
import Header from "./Header/Header";
import Sidebar from "./Sidebar/Sidebar";

export default function HeaderSidebarLayout({ children }) {
  return (
    <div className="w-full h-screen flex bg-gray-50">
      
      {/* Sidebar */}
      <div className="fixed z-40">
        <Sidebar />
      </div>

      {/* Main content with header */}
      <div className="flex-1 ml-20 flex flex-col h-full">

        <div className="fixed left-20 top-0 w-[calc(100%-4rem)] h-16 bg-white z-30">
          <Header />
        </div>

        <main className="scroll-container mt-16 overflow-y-auto p-6">
          {children}
        </main>

      </div>
    </div>
  );
}
