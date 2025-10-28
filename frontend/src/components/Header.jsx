import React from "react";

const Header = () => {
  return (
    <header className="w-full relative bg-cyan-50">
      <div className="w-full flex flex-col md:flex-row justify-between items-center p-4 md:p-6 gap-4 md:gap-0">
        {/* Logo */}
        <img
          className="w-48 md:w-64 lg:w-96 h-auto md:h-28 lg:h-36 object-contain"
          src="/images/cooktopialogo.png"
          alt="CookTopia Logo"
        />

        {/* Navigation aligned to the right */}
        <nav className="flex gap-8 md:gap-12 lg:gap-16 text-xl md:text-2xl lg:text-3xl text-black font-['Poppins']">
          <div className="hover:text-cyan-800 transition-colors duration-300 cursor-pointer">About</div>
          <div className="hover:text-cyan-800 transition-colors duration-300 cursor-pointer">Contact</div>
          <div className="hover:text-cyan-800 transition-colors duration-300 cursor-pointer">FAQ</div>
        </nav>
      </div>

      {/* Full-width Divider Line */}
      <div className="w-full h-[1px] bg-stone-300 -mt-4 md:-mt-10"></div>
    </header>
  );
};

export default Header;
