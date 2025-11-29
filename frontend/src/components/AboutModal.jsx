import React from 'react';

const AboutModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div 
      className="fixed inset-0 z-[100] bg-opacity-50 flex justify-center items-center p-4 backdrop-blur-sm"
      onClick={onClose} 
    >
      {/* Modal Container - Taller for more space */}
      <div  
        className="bg-white rounded-2xl shadow-2xl shadow-gray-600/40 border border-orange-800 p-10 w-full max-w-4xl h-[500px]  max-h-[100vh] relative transform transition-all duration-300 scale-100 opacity-100 mx-4" 
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

        {/* Content - LOTS OF SPACE above and below */}
        <div className="flex flex-col justify-center items-center px-6 h-full py-16">
          
          {/* Title - Improved font styling */}
          <h2 className="text-3xl md:text-5xl font-semibold text-[#FA6B0C] font-['Pacifico'] leading-snug mb-12 text-center tracking-normal">
            {/* ^^^ CHANGED: font-bold to font-semibold, leading-tight to leading-snug, tracking-tight to tracking-normal */}
            Discover Your Next Meal with <br/> CookTopia
          </h2>
          <br/>
          {/* Body Text - Improved font styling */}
          <div className="space-y-6 w-full max-w-2xl">
            <p className="text-gray-700 text-base md:text-lg font-['Poppins'] leading-normal text-center tracking-wide">
              {/* ^^^ CHANGED: leading-relaxed to leading-normal, added tracking-wide */}
              CookTopia is your ultimate recipe catalog, designed to help every food lover—from home cooks to professional chefs—discover, organize, and share their favorite recipes in one convenient platform.
            </p>
              
            <p className="text-gray-700 text-base md:text-lg font-['Poppins'] leading-normal text-center tracking-wide">
              We offer a vast collection of step-by-step guides and delicious recipes to explore different cuisines. Our mission is simple: to make cooking a fun, creative, and stress-free experience.
            </p>  

            <p className="text-gray-700 text-base md:text-lg font-['Poppins'] leading-normal text-center tracking-wide">
              Inspired by the challenge of keeping recipes reliably structured, our vision is to build a global community where food enthusiasts can share, learn, and expand their culinary knowledge together.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;