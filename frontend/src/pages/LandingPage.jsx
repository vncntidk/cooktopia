import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from '../modals/LoginModal';
import RegisterModal from '../modals/RegisterModal';
import ForgotPassModal from '../modals/ForgotPassModal';
import { useNavigate, useLocation } from 'react-router-dom';
import { sendVerificationEmail } from '../services/auth';
import Header from "../components/Header";
import Footer from '../components/Footer';

const LandingPage = () => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [forgotPassModalOpen, setForgotPassModalOpen] = useState(false);
  const { user, isAuthenticated, isVerified, loading } = useAuth();
  const [notice, setNotice] = useState('');
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated && isVerified) {
      navigate('/home', { replace: true });
    }
  }, [loading, isAuthenticated, isVerified, navigate]);

  useEffect(() => {
    if (location.state?.needsVerification) {
      setNotice('Please verify your email to continue.');
    }
  }, [location.state]);

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
      {/* Header */}
      <Header />

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
      <h1 className="text-5xl md:text-8xl lg:text-9xl text-[#EE8819] font-['Pacifico'] drop-shadow-md leading-tight">
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
          className="w-full sm:w-60 h-14 bg-[#FA6B0C] text-white text-xl font-semi-bold rounded-[30px] font-['Poppins'] shadow-[4px_5px_4px_0px_rgba(0,0,0,0.29)] hover:scale-105 transition-transform duration-300"
        >
          LOGIN
        </button>
        <button
          onClick={() => setRegisterModalOpen(true)}
          className="w-full sm:w-60 h-14 bg-[#FA6B0C] text-white text-xl font-semi-bold rounded-[30px] font-['Poppins'] shadow-[4px_5px_4px_0px_rgba(0,0,0,0.29)] hover:scale-105 transition-transform duration-300"
        >
          SIGN UP
        </button>
      </div>
       </div>
      </section>

      {/* Email Verification Notice */}
      {isAuthenticated && !isVerified && (
        <div className="w-full max-w-3xl mx-auto px-4 mt-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8 text-center">
            <div className="text-yellow-800 mb-3">
              {notice || 'Your email is not verified. Please check your inbox and click the verification link.'}
            </div>
            <button
              onClick={async () => {
                setSending(true);
                setNotice('');
                try {
                  await sendVerificationEmail();
                  setNotice('Verification email sent. Check your inbox.');
                } catch (e) {
                  setNotice(e.message || 'Failed to send verification email.');
                } finally {
                  setSending(false);
                }
              }}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-['Poppins'] text-sm disabled:opacity-50"
              disabled={sending}
            >
              Resend Verification Email
            </button>
          </div>
        </div>
      )}

          {/* Features Section */}
    <section className="w-full py-32 bg-[#FEFBF9] flex justify-center"style={{ marginBottom: '120px' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8"> {/* container centered */}
        <h2 className="text-4xl md:text-6xl lg:text-7xl text-[#EE8819] font-['Pacifico'] text-center mb-20 drop-shadow-md">
          Where every recipe finds a home
        </h2>

        {/* Features + Illustration Container */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-28">
          
        <div
  className="grid grid-cols-1 sm:grid-cols-2 gap-10 md:gap-x-30  md:gap-y-10 justify-items-center flex-1"
  style={{ marginTop: "80px" }}
>
              {[
                { title: "Save Favorites", desc: "Keep your favorite recipes in one place.", icon: "⭐" },
                { title: "Easy Search", desc: "Quickly find what you crave.", icon: "🔍" },
                { title: "Cook & Share", desc: "Share your own recipes.", icon: "🥣" },
                { title: "Ratings & Feedback", desc: "Rate and review recipes.", icon: "🏅" }
              ].map((feature) => (
                <div 
                  key={feature.title} 
                  // Cleaner Card Style: White background, bold border on hover, flexible sizing
                  className="bg-white rounded-xl p-6 md:p-8 text-gray-800 flex flex-col items-center gap-4 shadow-lg border-b-4 border-transparent hover:border-[#BC4F07]
                   hover:shadow-xl transition-all duration-300 w-[350px] h-[220px] max-w-sm"
                >
                  
                  {/* Icon Circle (Brand Color Accent) */}
                  <div className="w-16 h-16 bg-[#EE8819]/10 rounded-full flex items-center justify-center text-3xl mb-2 transition-transform duration-300 group hover:scale-105" style= {{marginTop: '25px'
                  }}>
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-bold text-[#BC4F07] group-hover:text-[#FA6B0C] transition-colors duration-300">{feature.title}</h3>
                  <p className="text-sm md:text-base text-gray-600 text-center leading-relaxed">{feature.desc}</p>
                </div>
            ))}
          </div>

          {/* Illustration */}
          <div className="flex-1 max-w-md lg:max-w-lg hidden lg:flex justify-center">
            <img
              src="/images/landingpage2.png"
              alt="Cooking Illustration"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>

    <section className="w-full py-20 md:py-28 lg:py-36 bg-[#FEFBF9] flex justify-center overflow-hidden" style={{ marginBottom: '100px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl text-[#EE8819] font-['Pacifico'] mb-16 drop-shadow-md leading-tight">
            Getting started is simple...
          </h2>

          <div  className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 lg:gap-20"
  style={{ marginTop: "60px" }}>
          {[
              { title: "DISCOVER", desc: "Find recipes you'll love.", icon: "🔍", color: "#E0F7FA" },
              { title: "CREATE", desc: "Cook with simple, easy steps.", icon: "👨‍🍳", color: "#FFE0B2" },
              { title: "SHARE", desc: "Share your creations with others.", icon: "💝", color: "#F8BBD0" },
            ].map((step) => (
              <div
                key={step.number}
                className="relative bg-white rounded-3xl p-8 pb-12 flex flex-col items-center gap-6 shadow-xl hover:shadow-2xl transition-all duration-500 ease-in-out transform 
                hover:-translate-y-2 group w-[400px] h-[240px]"style={{ marginBottom: '80px' }}
              >
                {/* Icon Circle */}
                <div
                  className="w-24 h-24 flex items-center justify-center rounded-full text-5xl mt-8 shadow-inner group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: step.color, marginTop: '25px' }} 
                >
                  {step.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mt-4 group-hover:text-[#EE8819] transition-colors duration-300">{step.title}</h3>
                <p className="text-gray-600 text-base leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

{/* Recipe Showcase Section */}
<section className="w-full py-32 bg-[#FEFBF9] flex flex-col items-center text-center" style={{ marginBottom: '120px' }}>
  <h2 className="text-4xl md:text-6xl lg:text-7xl text-[#EE8819] font-['Pacifico'] mb-10 drop-shadow-md">
    Your recipe haven awaits!
  </h2>
  <img src="/images/landingpage3.png" className="w-full max-w-4xl h-auto rounded-3xl shadow-xl mb-8 mx-auto" alt="Recipe Showcase" />
  <p className="text-lg md:text-xl lg:text-xl max-w-2xl mx-auto mb-10 font-['Poppins']" style={{ marginTop: '18px' }}>
    Discover dishes that feel like home, no matter where you are
  </p>
  <button
    onClick={() => setRegisterModalOpen(true)}
    className="w-full sm:w-64 h-14 md:h-14 bg-[#FA6B0C] text-white rounded-[30px] shadow hover:scale-105 transition-transform duration-300 font-['Poppins']" style={{ marginTop: '45px' }}
  >
    Let's Get Cooking!
  </button>
</section>

      <Footer/>


      {/* Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onForgotPassword={() => {
          setLoginModalOpen(false);
          setForgotPassModalOpen(true);
        }}
        onSignUp={() => {
          setLoginModalOpen(false);
          setRegisterModalOpen(true);
        }}
      />
      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSignIn={() => {
          setRegisterModalOpen(false);
          setLoginModalOpen(true);
        }}
      />
      <ForgotPassModal
        isOpen={forgotPassModalOpen}
        onClose={() => setForgotPassModalOpen(false)}
        onSignIn={() => {
          setForgotPassModalOpen(false);
          setLoginModalOpen(true);
        }}
      />
    </div> 
  );
};

export default LandingPage;
