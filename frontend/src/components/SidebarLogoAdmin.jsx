import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Star, Users, Activity, Menu, X, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase-config";
import toast from "react-hot-toast";

export default function SidebarLogoAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (location.pathname.includes("/admin")) {
      if (location.pathname.includes("reviews")) {
        setActiveItem("Reviews");
      } else if (location.pathname.includes("users")) {
        setActiveItem("Users");
      } else if (location.pathname.includes("activity")) {
        setActiveItem("Activity");
      } else {
        setActiveItem("Dashboard");
      }
    }
  }, [location]);

  const handleNavigation = (item, route) => {
    setActiveItem(item);
    if (route) navigate(route);
    setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    setIsSidebarOpen(false);
    try {
      await signOut(auth);
      toast.success("Signed out successfully!");
      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const navItemBaseClass =
    "self-stretch h-12 sm:h-14 pl-3 sm:pl-4 pr-2 sm:pr-3 py-2 inline-flex justify-start items-center gap-2 cursor-pointer hover:bg-gray-200 transition-colors";

  const activeClass = "bg-gradient-to-r from-[#FFE8CD] to-[#6BC4A6]";

  return (
    <>
      {/* Menu Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-stone-100 rounded-md shadow-md hover:bg-stone-200 transition-colors"
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X className="w-6 h-6 text-black" /> : <Menu className="w-6 h-6 text-black" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-70 lg:w-64 bg-gray-50 flex flex-col justify-start items-start gap-0 py-3 sm:py-4 z-40 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ paddingTop: "5rem" }}
      >
        {/* Logo */}
        <div className="self-stretch flex justify-center items-center h-20 px-3 relative -mt-4">
          <img className="h-full object-contain" src="/images/cooktopialogo.png" alt="Cooktopia Logo" />
        </div>

        {/* Admin Greeting */}
        <div className="self-stretch px-3 inline-flex justify-start items-center gap-2" style={{ marginLeft: 10, marginTop: 10, marginBottom: 20 }}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 relative flex-shrink-0">
            <img className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover" src="/profile.png" alt="Admin Profile" />
          </div>
          <div className="text-center justify-start text-black text-xs sm:text-sm font-medium font-['Poppins']">Hi, Admin!</div>
        </div>

        {/* Dashboard */}
        <div
          data-side-bar="Dashboard"
          onClick={() => handleNavigation("Dashboard", "/admin")}
          className={`${navItemBaseClass} ${activeItem === "Dashboard" ? activeClass : ""}`}
        >
          <LayoutDashboard className={`w-10 h-4 flex-shrink-0 ${activeItem === "Dashboard" ? "text-black" : "text-gray-700"}`} strokeWidth={2} />
          <div className={`text-xs sm:text-sm font-['Poppins'] ${activeItem === "Dashboard" ? "font-semibold" : "font-normal"}`}>DASHBOARD</div>
        </div>

        {/* Reviews */}
        <div
          data-side-bar="Reviews"
          onClick={() => handleNavigation("Reviews", "/admin/reviews")}
          className={`${navItemBaseClass} ${activeItem === "Reviews" ? activeClass : ""}`}
        >
          <Star className={`w-10 h-4 flex-shrink-0 ${activeItem === "Reviews" ? "text-black" : "text-gray-700"}`} strokeWidth={2} />
          <div className={`text-xs sm:text-sm font-['Poppins'] ${activeItem === "Reviews" ? "font-semibold" : "font-normal"}`}>REVIEWS</div>
        </div>

        {/* Users */}
        <div
          data-side-bar="Users"
          onClick={() => handleNavigation("Users", "/admin/users")}
          className={`${navItemBaseClass} ${activeItem === "Users" ? activeClass : ""}`}
        >
          <Users className={`w-10 h-4 flex-shrink-0 ${activeItem === "Users" ? "text-black" : "text-gray-700"}`} strokeWidth={2} />
          <div className={`text-xs sm:text-sm font-['Poppins'] ${activeItem === "Users" ? "font-semibold" : "font-normal"}`}>USERS</div>
        </div>

        {/* Activity */}
        <div
          data-side-bar="Activity"
          onClick={() => handleNavigation("Activity", "/admin/activity")}
          className={`${navItemBaseClass} ${activeItem === "Activity" ? activeClass : ""}`}
        >
          <Activity className={`w-10 h-4 flex-shrink-0 ${activeItem === "Activity" ? "text-black" : "text-gray-700"}`} strokeWidth={2} />
          <div className={`text-xs sm:text-sm font-['Poppins'] ${activeItem === "Activity" ? "font-semibold" : "font-normal"}`}>ACTIVITY</div>
        </div>

        {/* Logout */}
        <div
          data-side-bar="Logout"
          onClick={handleLogout}
          className={`mt-auto ${navItemBaseClass} hover:bg-red-100`}
          style={{ width: "100%", borderTop: "1px solid #e5e7eb" }}
        >
          <LogOut className="w-10 h-4 flex-shrink-0 text-red-500" strokeWidth={2} />
          <div className="text-xs sm:text-sm font-['Poppins'] text-red-500">LOG OUT</div>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30" onClick={() => setIsSidebarOpen(false)} />
      )}
    </>
  );
}
