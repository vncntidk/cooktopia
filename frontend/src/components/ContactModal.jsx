import React from 'react';

const ContactModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    // Backdrop with gradient background
    <div 
      className="fixed inset-0 z-[100] bg-opacity-50 flex justify-center items-center p-4 backdrop-blur-sm"
      onClick={onClose} 
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 opacity-90"></div>
      
      {/* Floating food icons/patterns in background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 text-4xl">🍳</div>
        <div className="absolute top-40 right-20 text-3xl">👨‍🍳</div>
        <div className="absolute bottom-32 left-20 text-4xl">🥘</div>
        <div className="absolute bottom-20 right-16 text-3xl">🌶️</div>
        <div className="absolute top-1/3 left-1/4 text-2xl">🥕</div>
        <div className="absolute bottom-1/4 right-1/3 text-3xl">🍲</div>
      </div>

      {/* Modal Container - Adjusted height and removed overflow */}
      <div  
        className="bg-white/95 rounded-2xl shadow-2xl shadow-orange-500/20 border border-orange-200 p-10 w-full max-w-4xl h-[500px] relative transform transition-all duration-300 scale-100 opacity-100 mx-4 backdrop-blur-sm" 
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Decorative elements */}
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-orange-500 rounded-full opacity-20"></div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 rounded-full opacity-20"></div>
        <div className="absolute top-1/2 -left-3 w-4 h-4 bg-yellow-400 rounded-full opacity-30"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-orange-600 text-3xl leading-none transition-colors duration-200 bg-white/80 rounded-full w-10 h-10 flex items-center justify-center shadow-sm hover:shadow-md"
          aria-label="Close"
        >
          &times;
        </button>

        {/* Content */}
        <div className="flex flex-col justify-center items-center px-6 h-full py-8">
          
          {/* Title with gradient text */}
          <h2 className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent font-['Poppins'] leading-snug mb-8 text-center tracking-normal">
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