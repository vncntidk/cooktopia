import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Star, Users, Activity, Menu, X } from "lucide-react";

export default function SidebarLogoAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Update active state based on current route
  React.useEffect(() => {
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
    if (route) {
      navigate(route);
    }
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-stone-100 rounded-md shadow-md hover:bg-stone-200 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-black" />
        ) : (
          <Menu className="w-6 h-6 text-black" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:static h-screen w-52 lg:w-48 bg-gray-50 flex flex-col justify-start items-start gap-2 sm:gap-3 py-3 sm:py-4 z-40 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo Section */}
        <div className="self-stretch h-14 sm:h-16 px-3 relative">
          <img
            className="h-full left-0 top-0 absolute object-contain object-left"
            src="/images/cooktopialogo.png"
            alt="Cooktopia Logo"
          />
        </div>

        {/* Admin Greeting Section */}
        <div className="self-stretch px-3 inline-flex justify-start items-center gap-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 relative flex-shrink-0">
            <img
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
              src="/profile.png"
              alt="Admin Profile"
            />
          </div>
          <div className="text-center justify-start text-black text-xs sm:text-sm font-medium font-['Poppins']">
            Hi, Admin!
          </div>
        </div>

        {/* Dashboard Navigation Item */}
        <div
          data-side-bar="Dashboard Clicked"
          onClick={() => {
            handleNavigation("Dashboard", "/admin");
            setIsMobileMenuOpen(false);
          }}
          className={`self-stretch h-10 sm:h-11 pl-3 sm:pl-4 pr-2 sm:pr-3 py-2 ${
            activeItem === "Dashboard"
              ? "bg-gradient-to-r from-orange-300 to-orange-400"
              : ""
          } inline-flex justify-start items-center gap-2 cursor-pointer hover:bg-orange-200 transition-colors`}
        >
          <LayoutDashboard 
            className={`w-4 h-4 flex-shrink-0 ${
              activeItem === "Dashboard" ? "text-black" : "text-gray-700"
            }`} 
            strokeWidth={2}
          />
          <div className={`text-center justify-start text-black text-xs sm:text-sm font-['Poppins'] ${
            activeItem === "Dashboard" ? "font-semibold" : "font-normal"
          }`}>
            DASHBOARD
          </div>
        </div>

        {/* Reviews Navigation Item */}
        <div
          data-side-bar="Reports"
          onClick={() => {
            handleNavigation("Reviews", "/admin/reviews");
            setIsMobileMenuOpen(false);
            
          }}
          className={`self-stretch h-10 sm:h-11 pl-3 sm:pl-4 pr-2 sm:pr-3 py-2 ${
            activeItem === "Reviews"
              ? "bg-gradient-to-r from-orange-300 to-orange-400"
              : ""
          } inline-flex justify-start items-center gap-2 cursor-pointer hover:bg-orange-200 transition-colors`}
        >
          <Star 
            className={`w-4 h-4 flex-shrink-0 ${
              activeItem === "Reviews" ? "text-black" : "text-gray-700"
            }`} 
            strokeWidth={2}
          />
          <div className={`text-center justify-start text-black text-xs sm:text-sm font-['Poppins'] ${
            activeItem === "Reviews" ? "font-semibold" : "font-normal"
          }`}>
            REVIEWS
          </div>
        </div>

        {/* Users Navigation Item */}
        <div
          data-side-bar="Users"
          onClick={() => {
            handleNavigation("Users", "/admin/users");
            setIsMobileMenuOpen(false);
          }}
          className={`self-stretch h-10 sm:h-11 pl-3 sm:pl-4 pr-2 sm:pr-3 py-2 ${
            activeItem === "Users"
              ? "bg-gradient-to-r from-orange-300 to-orange-400"
              : ""
          } inline-flex justify-start items-center gap-2 cursor-pointer hover:bg-orange-200 transition-colors`}
        >
          <Users 
            className={`w-4 h-4 flex-shrink-0 ${
              activeItem === "Users" ? "text-black" : "text-gray-700"
            }`} 
            strokeWidth={2}
          />
          <div className={`text-center justify-start text-black text-xs sm:text-sm font-['Poppins'] ${
            activeItem === "Users" ? "font-semibold" : "font-normal"
          }`}>
            USERS
          </div>
        </div>

        {/* Activity Navigation Item */}
        <div
          data-side-bar="Activity"
          onClick={() => {
            handleNavigation("Activity", "/admin/activity");
            setIsMobileMenuOpen(false);
          }}
          className={`self-stretch h-10 sm:h-11 pl-3 sm:pl-4 pr-2 sm:pr-3 py-2 ${
            activeItem === "Activity"
              ? "bg-gradient-to-r from-orange-300 to-orange-400"
              : ""
          } inline-flex justify-start items-center gap-2 cursor-pointer hover:bg-orange-200 transition-colors`}
        >
          <Activity 
            className={`w-4 h-4 flex-shrink-0 ${
              activeItem === "Activity" ? "text-black" : "text-gray-700"
            }`} 
            strokeWidth={2}
          />
          <div className={`text-center justify-start text-black text-xs sm:text-sm font-['Poppins'] ${
            activeItem === "Activity" ? "font-semibold" : "font-normal"
          }`}>
            ACTIVITY
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

