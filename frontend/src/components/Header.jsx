import React from "react";

const Header = () => {
  return (
    // CHANGE: 'relative' replaced with 'fixed top-0 left-0 w-full bg-white'
    // 'fixed top-0 left-0 w-full' locks it to the viewport, and 'z-50' ensures it stays on top of content.
    // I added 'bg-white' to prevent content from showing through the header when fixed.
    <header className="w-full h-22 px-4 fixed top-0 left-0 z-50 bg-white shadow-md">
      {/* Centered container with max width and horizontal padding */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 flex flex-col md:flex-row justify-between items-center">
        
        {/* Logo */}
        <img
          className="w-32 md:w-40 lg:w-52 h-auto md:h-20 lg:h-24 object-contain"
          src="/images/cooktopialogo.png"
          alt="CookTopia Logo"
          style={{ marginLeft: '24px' }} 
        />

        {/* Navigation aligned right with spacing from edge */}
        <nav className="w-96 h-11 right-1 top-[38px] absolute flex justify-center items-start gap-10 text-base md:text-lg lg:text-xl text-black font-['Poppins']">
          <div className="hover:text-cyan-800 transition-colors duration-300 cursor-pointer">About</div>
          <div className="hover:text-cyan-800 transition-colors duration-300 cursor-pointer">Contact</div>
          <div className="hover:text-cyan-800 transition-colors duration-300 cursor-pointer">FAQ</div>
        </nav>
      </div>

  
    </header>
  );
};

export default Header;