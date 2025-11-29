import React, { useState } from "react";
import AboutModal from './Aboutmodal';
import ContactModal from './ContactModal';

const Header = () => {
  // State to control whether the modals are open or closed
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const openAboutModal = () => setIsAboutModalOpen(true);
  const closeAboutModal = () => setIsAboutModalOpen(false);
  
  const openContactModal = () => setIsContactModalOpen(true);
  const closeContactModal = () => setIsContactModalOpen(false);

  return (
    <>
      <header className="w-full h-10 px-4 top-2 z-50 relative">
        {/* Centered container with max width and horizontal padding */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 flex flex-col md:flex-row justify-between items-center">
          
          {/* Logo */}
          <img
            className="w-32 md:w-40 lg:w-52 h-auto md:h-20 lg:h-24 object-contain"
            src="/images/cooktopialogo.png"
            alt="CookTopia Logo"
            style={{ marginLeft: '24px' }}
          />

          {/* Navigation aligned right */}
          <nav className="w-96 h-11 right-1 top-[38px] absolute flex justify-center items-start gap-10 text-base md:text-lg lg:text-xl text-black font-['Poppins']">
            
            {/* About link */}
            <div 
              className="hover:text-orange-800 transition-colors duration-300 cursor-pointer"
              onClick={openAboutModal}
            >
              About
            </div>
            
            {/* Contact link */}
            <div 
              className="hover:text-orange-800 transition-colors duration-300 cursor-pointer"
              onClick={openContactModal}
            >
              Contact
            </div>
            
            <div className="hover:text-orange-800 transition-colors duration-300 cursor-pointer">FAQ</div>
          </nav>
        </div>

        {/* Full-width Divider Line */}
        <div className="w-full h-[1px] bg-stone-300 mt-4"></div>
      </header>
      
      {/* The About Modal component */}
      <AboutModal isOpen={isAboutModalOpen} onClose={closeAboutModal} />
      
      {/* The Contact Modal component */}
      <ContactModal isOpen={isContactModalOpen} onClose={closeContactModal} />
    </>
  );
};

export default Header;