import React, { useState } from 'react';
import AboutModal from './Aboutmodal';

const Footer = () => {
  // State to control whether the modal is open or closed
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
          {/* About link now opens the modal */}
          <div 
            className="hover:text-orange-800 text-gray-800 transition-colors duration-300 cursor-pointer p-1"
            onClick={openModal} // Handler to open the modal
          >
            About
          </div> 
          <div className="hover:text-orange-800 text-gray-800 transition-colors duration-300 cursor-pointer p-1">Contact</div>
          <div className="hover:text-orange-800 text-gray-800 transition-colors duration-300 cursor-pointer p-1">FAQ</div>
        </nav>

        {/* Copyright notice */}
        <div className="text-sm text-gray-500 mt-4 font-['Poppins']">
          © {new Date().getFullYear()} CookTopia. All Rights Reserved.
        </div>
      </footer>

      {/* The About Modal component, controlled by state */}
      <AboutModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}

export default Footer;