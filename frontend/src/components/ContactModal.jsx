import React from 'react';

const ContactModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    // Backdrop with higher z-index (z-[150]) to appear on top of FAQ modal
    <div 
      className="fixed inset-0 z-[150] bg-opacity-50 flex justify-center items-center p-4 backdrop-blur-sm"
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

      {/* Modal Container */}
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
            <br/>
            {/* Email with emphasis */}
            <div className="text-center">
              <p className="text-xl md:text-xl font-bold text-[#FA6B0C] font-['Poppins'] mb-6">
                cooktopiainc@gmail.com
              </p>
            </div>
            <br/>

            <p className="text-gray-700 text-base md:text-lg font-['Poppins'] leading-normal text-center tracking-wide">
              Oh! And don't forget to follow us.
            </p>
            <br/>

            {/* Social Media Icons */}
            <div className="flex justify-center gap-8 mt-10">
              {/* Facebook Icon */}
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 hover:from-blue-700 hover:to-blue-900"
                aria-label="Follow us on Facebook"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* Instagram Icon */}
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-pink-500 via-purple-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 hover:from-pink-600 hover:via-purple-600 hover:to-yellow-600"
                aria-label="Follow us on Instagram"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* TikTok Icon */}
              <a 
                href="https://tiktok.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 hover:from-black hover:via-gray-900 hover:to-gray-800"
                aria-label="Follow us on TikTok"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;