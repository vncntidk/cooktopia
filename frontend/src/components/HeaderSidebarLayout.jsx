import React from "react";
import Header from "./Header/Header";
import Sidebar from "./Sidebar/Sidebar";

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <Sidebar />
      <main className="pt-16 pr-16">
        {children}
      </main>
    </>
  );
}