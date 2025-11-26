import React from "react";

const Header = () => {
  return (
    <header className="w-full h-10 px-4 top-2 z-50 relative">
      {/* Centered container with max width and horizontal padding */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 flex flex-col md:flex-row justify-between items-center">
        
        {/* Logo */}
        <img
          className="w-32 md:w-40 lg:w-52 h-auto md:h-20 lg:h-24 object-contain"
          src="/images/cooktopialogo.png"
          alt="CookTopia Logo"
          style={{ marginLeft: '24px' }} // Added inline style for 8px left margin to move logo slightly right
        />


        {/* Navigation aligned right with spacing from edge */}
        <nav className="w-96 h-11 right-1 top-[38px] absolute flex justify-center items-start gap-10 text-base md:text-lg lg:text-xl text-black font-['Poppins']">
          <div className="hover:text-cyan-800 transition-colors duration-300 cursor-pointer">About</div>
          <div className="hover:text-cyan-800 transition-colors duration-300 cursor-pointer">Contact</div>
          <div className="hover:text-cyan-800 transition-colors duration-300 cursor-pointer">FAQ</div>
        </nav>
      </div>

      {/* Full-width Divider Line */}
      <div className="w-full h-[1px] bg-stone-300 mt-4"></div>
    </header>
  );
};

export default Header;
