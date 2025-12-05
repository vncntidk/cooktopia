import React, { useState } from 'react';

const FAQModal = ({ isOpen, onClose, onContactClick }) => {
  const [activeTab, setActiveTab] = useState('getting-started');

  if (!isOpen) return null;

  // FAQ Data organized by categories with your new questions
  const faqCategories = {
    'getting-started': [
      { 
        question: "What is CookTopia?", 
        answer: "CookTopia is a recipe catalog designed to help food lovers discover, organize, and share their favorite recipes. Whether you're a beginner or a professional chef, our platform offers a vast collection of recipes, step-by-step guides, and an interactive way to explore different cuisines." 
      },
      { 
        question: "Is CookTopia free to use?", 
        answer: "Yes! CookTopia is completely free to browse, save, and share recipes. We believe cooking should be accessible and enjoyable for everyone." 
      },
      { 
        question: "How can I join the CookTopia community?", 
        answer: "Simply sign up for a free account to start saving recipes, sharing your own creations, and connecting with fellow food lovers." 
      },
    ],
    'features': [
      { 
        question: "How do I search for recipes?", 
        answer: "You can search for recipes using keywords or filter them based on ingredients, cooking time, meal type, or dietary preferences. Our advanced search makes it easy to find exactly what you're looking for." 
      },
      { 
        question: "Can I save my favorite recipes?", 
        answer: "Absolutely! You can bookmark your favorite recipes for quick access anytime, helping you build your own personalized recipe collection." 
      },
      { 
        question: "Does CookTopia provide step-by-step cooking guides?", 
        answer: "Yes! Each recipe includes detailed, easy-to-follow cooking instructions to help you achieve perfect results every time." 
      },
    ],
    'contributing': [
      { 
        question: "Can I contribute my own recipes?", 
        answer: "Yes! CookTopia encourages users to share their own recipes with the community. Simply create an account, upload your recipe details, and inspire others with your culinary creations." 
      },
      { 
        question: "Are there guidelines for submitting recipes?", 
        answer: "Yes, we recommend including clear ingredient lists, step-by-step instructions, cooking time, and photos if possible. Make sure your recipe is original or properly attributed." 
      },
      { 
        question: "Can I edit or delete my submitted recipes?", 
        answer: "Yes, you can edit or delete your recipes at any time from your profile page." 
      },
    ],
    'technical': [
      { 
        question: "Can I use CookTopia on my phone or tablet?", 
        answer: "Yes! CookTopia is mobile-friendly, so you can browse, save, and cook from any device with ease." 
      },
      { 
        question: "Who can I contact for support?", 
        answer: "If you have any questions or need assistance, feel free to reach out to our support team via our Contact Us page. We're here to help!" 
      },
    ]
  };

  return (
    // Backdrop - z-[100]
    <div 
      className="fixed inset-0 z-[100] bg-opacity-50 flex justify-center items-center p-4 backdrop-blur-sm"
      onClick={onClose} 
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 opacity-90"></div>
      
      {/* Floating food icons/patterns in background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 text-4xl">❓</div>
        <div className="absolute top-40 right-20 text-3xl">🤔</div>
        <div className="absolute bottom-32 left-20 text-4xl">📖</div>
        <div className="absolute bottom-20 right-16 text-3xl">💡</div>
        <div className="absolute top-1/3 left-1/4 text-2xl">🥗</div>
        <div className="absolute bottom-1/4 right-1/3 text-3xl">🍽️</div>
      </div>

      {/* Modal Container */}
      <div  
        className="bg-white/95 rounded-2xl shadow-2xl shadow-orange-500/20 border border-orange-200 p-10 w-full max-w-4xl h-[650px] relative transform transition-all duration-300 scale-100 opacity-100 mx-4 backdrop-blur-sm" 
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
        <div className="flex flex-col items-center justify-center h-full">
          
          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent font-['Poppins'] leading-snug mb-4 text-center">
            Frequently Asked Questions
          </h2>
          
          {/* Subtitle */}
          <p className="text-gray-600 mb-8 font-['Poppins'] text-center">
            Find answers to common questions about CookTopia
          </p>
          <br/>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-4 mb-10 justify-center">
            {Object.keys(faqCategories).map((category) => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`px-8 py-3 h-12 min-w-[160px] rounded-full font-medium transition-all duration-300 capitalize font-['Poppins'] text-base text-center ${
                  activeTab === category 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'getting-started' ? 'Getting Started' : 
                 category === 'features' ? 'Features' : 
                 category === 'contributing' ? 'Contributing' : 'Technical'}
              </button>
            ))}
          </div>

          {/* FAQ Content Area */}
          <div className="w-full max-w-3xl h-[350px] flex flex-col items-center justify-center">
            <div className="space-y-10 flex flex-col items-center w-full">
              {faqCategories[activeTab].map((faq, index) => (
                <div 
                  key={index} 
                  className="w-full flex flex-col items-center"
                >
                  {/* Question */}
                  <div className="text-center mb-4">
                    <h3 className="font-semibold text-gray-800 font-['Poppins'] text-xl">
                      {faq.question}
                    </h3>
                  </div>

                  {/* Answer */}
                  <div className="flex justify-center w-full">
                    <div className="flex items-start max-w-2xl">
                      <div className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold font-['Poppins'] text-sm mr-3">
                        A
                      </div>
                      <p className="text-gray-600 font-['Poppins'] text-base leading-relaxed text-center">
                        {faq.answer}
                      </p>
                    </div>
                  </div>

                  {/* Separator line */}
                  {index < faqCategories[activeTab].length - 1 && (
                    <div className="w-32 h-px bg-gray-300 mt-8 mx-auto"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Help Text at Bottom */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200 w-full max-w-2xl">
            <p className="text-gray-600 font-['Poppins'] text-base">
              Still have questions?{' '}
              <span 
                className="text-orange-600 font-medium cursor-pointer hover:text-orange-700 transition-colors"
                onClick={() => {
                  // Don't close FAQ modal, just open Contact modal
                  if (onContactClick) {
                    onContactClick();
                  }
                }}
              >
                Contact us!
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQModal;