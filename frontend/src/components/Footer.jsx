import React, { useState } from 'react';
import AboutModal from './Aboutmodal';
import ContactModal from './ContactModal';
import FAQModal from './FAQModal';

const Footer = () => {
  // States for all modals
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);

  // Modal handlers
  const openAboutModal = () => setIsAboutModalOpen(true);
  const closeAboutModal = () => setIsAboutModalOpen(false);
  
  const openContactModal = () => setIsContactModalOpen(true);
  const closeContactModal = () => setIsContactModalOpen(false);
  
  const openFAQModal = () => setIsFAQModalOpen(true);
  const closeFAQModal = () => setIsFAQModalOpen(false);

  // Handler for when "Contact us!" is clicked in FAQ modal
  const handleContactFromFAQ = () => {
    openContactModal();
  };

  return (
    <>
      <footer className="w-full bg-[#FEFBF9] flex flex-col justify-center items-center gap-8 p-12 md:p-16 text-center">
        <img 
          className="w-48 md:w-64 lg:w-96 h-auto md:h-28 lg:h-36 object-contain" 
          src="/images/cooktopialogo.png" 
          alt="CookTopia Logo" 
        />

        {/* Description Text */}
        <p className="text-base md:text-lg lg:text-xl font-['Poppins'] max-w-8xl mx-auto text-gray-700"> 
          Welcome to Cooktopia! Join our community of food lovers, home chefs, and culinary adventurers.<br />
          Share recipes, discover new flavors, and make every meal special! 
        </p> 

        {/* Navigation Links */}
        <nav className="flex gap-8 md:gap-12 lg:gap-16 text-xl md:text-xl font-['Poppins'] flex-wrap justify-center"> 
          {/* About link */}
          <div 
            className="hover:text-orange-800 text-gray-800 transition-colors duration-300 cursor-pointer p-1"
            onClick={openAboutModal}
          >
            About
          </div> 
          
          {/* Contact link */}
          <div 
            className="hover:text-orange-800 text-gray-800 transition-colors duration-300 cursor-pointer p-1"
            onClick={openContactModal}
          >
            Contact
          </div>
          
          {/* FAQ link */}
          <div 
            className="hover:text-orange-800 text-gray-800 transition-colors duration-300 cursor-pointer p-1"
            onClick={openFAQModal}
          >
            FAQ
          </div>
        </nav>

        {/* Copyright notice */}
        <div className="text-sm text-gray-500 mt-4 font-['Poppins']">
          © {new Date().getFullYear()} CookTopia. All Rights Reserved.
        </div>
      </footer>

      {/* Modal Components */}
      <AboutModal isOpen={isAboutModalOpen} onClose={closeAboutModal} />
      <ContactModal isOpen={isContactModalOpen} onClose={closeContactModal} />
      
      {/* FAQ Modal with onContactClick prop */}
      <FAQModal 
        isOpen={isFAQModalOpen} 
        onClose={closeFAQModal}
        onContactClick={handleContactFromFAQ}
      />
    </>
  );
}

export default Footer;