import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminLoginModal from '../modals/AdminLoginModal';
import { useNavigate, useLocation } from 'react-router-dom';
import { sendVerificationEmail } from '../services/auth';

const LandingPage = () => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [forgotPassModalOpen, setForgotPassModalOpen] = useState(false);
  const { user, isAuthenticated, isVerified, loading, isAdmin } = useAuth();
  const [notice, setNotice] = useState('');
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If already logged in as admin, redirect to /admin
    if (!loading && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FEFBF9]"> {/* Wrapped entire page with consistent background */}
      <header className="w-full h-10 px-4 top-2 z-50 relative">
        {/* Centered container with max width and horizontal padding */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 flex flex-col md:flex-row justify-between items-center">
          
          {/* Logo */}
          <img
            className="w-32 md:w-40 lg:w-52 h-auto md:h-20 lg:h-24 object-contain"
            src="/images/cooktopialogo.png"
            alt="CookTopia Logo"
            style={{ marginLeft: '24px' }} // Added inline style for 8px left margin to move logo slightly right
          />
        </div>

        {/* Full-width Divider Line */}
        <div className="w-full h-[1px] bg-stone-300 mt-4"></div>
      </header>

      {/* Hero Section */}
      <section className="w-full min-h-[700px] md:min-h-[780px] flex flex-col md:flex-row justify-center items-center px-6 md:px-12 py-12 bg-[#FEFBF9]"style={{ marginBottom: '150px', marginTop: '80px' }}>
        {/* Hero Image */}
        <div className="flex-1 flex justify-center items-center mb-8 md:mb-0">
          <img
            src="/images/landingpage1.png"
            alt="Hero"
               className="w-full max-w-lg md:max-w-xl lg:max-w-6xl h-auto object-contain"
          />
        </div>

        {/* Hero Text & Buttons */}
        <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left gap-6 md:gap-8">

        {/* Hero Heading #BC4F07*/}
      <h1 className="text-5xl md:text-8xl lg:text-9xl text-[#6BC4A6] font-['Pacifico'] drop-shadow-md leading-tight">
        <span className="block">Your Culinary</span>
        <span className="block mt-4 md:mt-6">Paradise</span>
      </h1>

      {/* Description */}
      <p className="text-base md:text-lg lg:text-xl text-gray-800 max-w-md md:max-w-lg font-['Poppins'] mt-4 md:mt-6 whitespace-nowrap">
      <span className="block">Discover, share, and celebrate the art of cooking with a</span>
      <span className="block mt-4 md:mt-6">passionate food-loving community.</span>
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-6 md:mt-8">
        <button
          onClick={() => setLoginModalOpen(true)}
          className="w-full sm:w-60 h-14 bg-[#6BC4A6] text-white text-xl font-semi-bold rounded-[30px] font-['Poppins'] shadow-[4px_5px_4px_0px_rgba(0,0,0,0.29)] hover:scale-105 transition-transform duration-300"
        >
          ADMIN LOGIN
        </button>
      </div>
       </div>
      </section>

      {/* Modals */}
      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div> 
  );
};

export default LandingPage;
