import React from 'react';

const ContactModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div 
      className="fixed inset-0 z-[100] bg-opacity-50 flex justify-center items-center p-4 backdrop-blur-sm"
      onClick={onClose} 
    >
      {/* Modal Container */}
      <div  
        className="bg-white rounded-2xl shadow-2xl shadow-gray-600/40 border border-orange-800 p-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 scale-100 opacity-100 mx-4" 
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-900 text-3xl leading-none transition-colors duration-200"
          aria-label="Close"
        >
          &times;
        </button>

        {/* Content */}
        <div className="flex flex-col justify-center items-center px-6 py-8">
          
          {/* Title */}
          <h2 className="text-3xl md:text-5xl font-semibold text-[#FA6B0C] font-['Pacifico'] leading-snug mb-8 text-center tracking-normal">
            Get In Touch With Us
          </h2>
          
          {/* Body Text */}
          <div className="space-y-6 w-full max-w-2xl">
            <p className="text-gray-700 text-base md:text-lg font-['Poppins'] leading-normal text-center tracking-wide">
              If you have any questions or just want to say hi, please send us an e-mail to
            </p>
            
            {/* Email with emphasis */}
            <div className="text-center">
              <p className="text-xl md:text-2xl font-bold text-[#FA6B0C] font-['Poppins'] mb-6">
                cooktopiainc@gmail.com
              </p>
            </div>

            <p className="text-gray-700 text-base md:text-lg font-['Poppins'] leading-normal text-center tracking-wide">
              Oh! And don't forget to follow us.
            </p>

            {/* Social Media Icons (Optional - you can add later) */}
            <div className="flex justify-center gap-6 mt-8">
              {/* Add social media icons here when you have them */}
              {/* <SocialIcon platform="instagram" />
                 <SocialIcon platform="facebook" />
                 <SocialIcon platform="twitter" /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;