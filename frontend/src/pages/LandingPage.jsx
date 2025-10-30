import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from '../modals/LoginModal';
import RegisterModal from '../modals/RegisterModal';
import ForgotPassModal from '../modals/ForgotPassModal';
import { useNavigate, useLocation } from 'react-router-dom';
import { sendVerificationEmail } from '../services/auth';
import Header from "../components/Header";


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
    <>
      {/* Header */}
      <Header />

      {/* Main content */}
      <div className="w-full min-h-screen bg-cyan-50 flex flex-col items-center gap-24 overflow-x-hidden">

        {/* Hero Section */}
        <section className="w-full min-h-[600px] md:h-[785px] flex flex-col md:flex-row justify-center items-center px-4 md:px-12 py-8 md:py-0 overflow-hidden">
          <div className="w-full md:w-auto md:flex-1 p-2.5 flex flex-col justify-center items-center gap-2.5 mb-8 md:mb-0">
            <img
              className="w-full max-w-md md:max-w-full md:h-[786px] h-auto object-contain"
              src="/images/landingpage1.png"
              alt="Hero Image"
            />
          </div>
          <div className="w-full md:w-auto md:flex-1 md:h-[520px] flex flex-col justify-between items-center md:items-end gap-6">
            <div className="flex-1 flex flex-col justify-start items-center md:items-end text-center md:text-right">
              <div className="w-full max-w-full md:w-[669px] text-cyan-800 text-4xl md:text-6xl lg:text-8xl font-normal font-['Pacifico'] leading-tight md:leading-[155px] [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)]">
                Your Culinary Paradise
                <div className="self-stretch text-black text-lg md:text-xl lg:text-2xl font-normal font-['Poppins'] leading-relaxed mt-4">
                  <p>Discover, share, and celebrate the art of cooking with a</p>
                  <p>passionate food-loving community.</p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="w-full flex flex-col sm:flex-row justify-center md:justify-end items-center gap-4 md:gap-9">
              <button
                onClick={() => setLoginModalOpen(true)}
                className="w-full sm:w-60 h-14 px-4 py-2.5 rounded-[20px] shadow-[4px_5px_4px_0px_rgba(0,0,0,0.29)] text-white text-xl md:text-2xl lg:text-3xl font-normal font-['Poppins'] transition-all duration-300 hover:scale-105 hover:shadow-[6px_7px_6px_0px_rgba(0,0,0,0.29)]"
                style={{ backgroundColor: "#6BC4A6" }}
              >
                LOGIN
              </button>
              <button
                onClick={() => setRegisterModalOpen(true)}
                className="w-full sm:w-60 h-14 px-4 py-2.5 rounded-[20px] shadow-[4px_5px_4px_0px_rgba(0,0,0,0.29)] text-white text-xl md:text-2xl lg:text-3xl font-normal font-['Poppins'] transition-all duration-300 hover:scale-105 hover:shadow-[6px_7px_6px_0px_rgba(0,0,0,0.29)]"
                style={{ backgroundColor: "#6BC4A6" }}
              >
                SIGN UP
              </button>
            </div>
          </div>
        </section>

        {/* Email Verification Notice */}
        {isAuthenticated && !isVerified && (
          <div className="w-full max-w-4xl mx-auto px-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <div className="text-yellow-800 mb-3">
                {notice || 'Your email is not verified. Please check your inbox and click the verification link. You will be automatically logged in once verified.'}
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
                className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 font-['Poppins'] text-sm"
                disabled={sending}
              >
                LOGIN
              </button>
              <button
                className="w-full sm:w-60 h-14 px-4 py-2.5 rounded-[20px] shadow-[4px_5px_4px_0px_rgba(0,0,0,0.29)] text-white text-xl md:text-2xl lg:text-3xl font-normal font-['Poppins'] transition-all duration-300 hover:scale-105 hover:shadow-[6px_7px_6px_0px_rgba(0,0,0,0.29)]"
                style={{ backgroundColor: "#6BC4A6" }}
              >
                SIGN UP
              </button>
            </div>
          </div>
        )}

        {/* Features Section */}
        <section className="w-full bg-cyan-50 py-20">
          <div className="max-w-7xl mx-auto px-8">
            {/* Section Title */}
            <div className="text-center mb-16">
              <h2 className="text-6xl md:text-7xl font-['Pacifico'] text-cyan-800 mb-6 [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)]">
                Where every recipe finds a home
              </h2>
            </div>

            {/* Features Layout */}
            <div className="flex flex-col lg:flex-row items-center gap-16">
              {/* Left Side - Features */}
              <div className="flex-1 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Feature 1 - Save Favorites */}
                  <div className="relative">
                    <div className="bg-teal-700 rounded-[40px] p-6 text-white relative overflow-hidden" style={{
                      clipPath: 'polygon(0% 0%, 85% 0%, 100% 15%, 100% 100%, 15% 100%, 0% 85%)'
                    }}>
                      <h3 className="text-xl font-bold font-['Poppins'] mb-2">Save Favorites</h3>
                      <p className="text-sm font-['Poppins'] leading-relaxed">
                        Review dishes and learn from the community.
                      </p>
                    </div>
                    {/* Overlapping stars icon */}
                    <div className="absolute -bottom-2 -left-2 w-12 h-12 flex items-center justify-center">
                      <div className="relative">
                        <span className="text-3xl text-yellow-400 drop-shadow-lg">⭐</span>
                        <span className="absolute top-0 left-1 text-2xl text-yellow-300 opacity-80">⭐</span>
                      </div>
                    </div>
                  </div>

                  {/* Feature 2 - Easy Search */}
                  <div className="relative">
                    <div className="bg-teal-700 rounded-[40px] p-6 text-white relative overflow-hidden" style={{
                      clipPath: 'polygon(15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%, 0% 15%)'
                    }}>
                      <h3 className="text-xl font-bold font-['Poppins'] mb-2">Easy Search</h3>
                      <p className="text-sm font-['Poppins'] leading-relaxed">
                        Find recipes by ingredients, diet, or difficulty.
                      </p>
                    </div>
                    {/* Overlapping magnifying glass icon */}
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 flex items-center justify-center">
                      <span className="text-3xl">🔍</span>
                    </div>
                  </div>

                  {/* Feature 3 - Cook & Share */}
                  <div className="relative">
                    <div className="bg-teal-700 rounded-[40px] p-6 text-white relative overflow-hidden" style={{
                      clipPath: 'polygon(0% 15%, 15% 0%, 100% 0%, 100% 100%, 0% 100%)'
                    }}>
                      <h3 className="text-xl font-bold font-['Poppins'] mb-2">Cook & Share</h3>
                      <p className="text-sm font-['Poppins'] leading-relaxed">
                        Upload your favorite recipes for others to try.
                      </p>
                    </div>
                    {/* Overlapping bowl icon */}
                    <div className="absolute -top-2 -right-2 w-12 h-12 flex items-center justify-center">
                      <span className="text-3xl">🥣</span>
                    </div>
                  </div>

                  {/* Feature 4 - Ratings & Feedback */}
                  <div className="relative">
                    <div className="bg-teal-700 rounded-[40px] p-6 text-white relative overflow-hidden" style={{
                      clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 85% 100%, 15% 100%, 0% 85%)'
                    }}>
                      <h3 className="text-xl font-bold font-['Poppins'] mb-2">Ratings & Feedback</h3>
                      <p className="text-sm font-['Poppins'] leading-relaxed">
                        Review dishes and learn from the community.
                      </p>
                    </div>
                    {/* Overlapping medal icon */}
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 flex items-center justify-center">
                      <span className="text-3xl">🏅</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Cooking Illustration */}
              <div className="flex-1 max-w-lg hidden lg:block">
                <div className="relative">
                  {/* Pan */}
                  <div className="w-full max-w-80 h-40 bg-teal-700 rounded-full relative mx-auto" style={{
                    clipPath: 'ellipse(100% 50% at 50% 100%)'
                  }}>
                    {/* Pan handle */}
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-16 h-6 bg-teal-700 rounded-r-full"></div>
                  </div>
                  
                  {/* Ingredients in pan */}
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-72 h-32">
                    {/* Shrimp */}
                    <div className="absolute top-4 left-8 w-6 h-4 bg-orange-400 rounded-full transform rotate-12"></div>
                    <div className="absolute top-8 left-12 w-5 h-3 bg-orange-400 rounded-full transform -rotate-6"></div>
                    <div className="absolute top-6 left-16 w-4 h-3 bg-orange-400 rounded-full transform rotate-45"></div>
                    
                    {/* Broccoli */}
                    <div className="absolute top-2 left-20 w-4 h-4 bg-green-500 rounded-full"></div>
                    <div className="absolute top-6 left-24 w-3 h-3 bg-green-500 rounded-full"></div>
                    
                    {/* Chili peppers */}
                    <div className="absolute top-4 left-32 w-3 h-6 bg-red-500 rounded-full"></div>
                    <div className="absolute top-8 left-36 w-2 h-4 bg-red-500 rounded-full"></div>
                    
                    {/* Sauce base */}
                    <div className="absolute bottom-0 left-0 w-full h-16 bg-orange-200 rounded-full opacity-60"></div>
                    <div className="absolute bottom-2 left-4 w-2 h-2 bg-orange-600 rounded-full"></div>
                    <div className="absolute bottom-4 left-12 w-1 h-1 bg-orange-600 rounded-full"></div>
                    <div className="absolute bottom-6 left-20 w-1 h-1 bg-orange-600 rounded-full"></div>
                  </div>
                  
                  {/* Spatula */}
                  <div className="absolute top-0 right-8 w-2 h-32 bg-gray-400 transform rotate-12 origin-bottom"></div>
                  <div className="absolute top-28 right-6 w-8 h-4 bg-gray-300 rounded-full"></div>
                  
                  {/* Seasoning cloud */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="w-16 h-12 bg-blue-200 rounded-full opacity-60"></div>
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-600 rounded-full"></div>
                    {/* Spice particles */}
                    <div className="absolute top-12 left-1/2 transform -translate-x-1/2">
                      <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce"></div>
                      <div className="absolute top-2 left-2 w-1 h-1 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="absolute top-4 left-1 w-1 h-1 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="w-full py-20 bg-cyan-50">
          <div className="max-w-7xl mx-auto px-8">
            {/* Section Title */}
            <div className="text-center mb-16">
              <h2 className="text-6xl md:text-7xl font-['Pacifico'] text-cyan-800 mb-6 [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)]">
                It's as easy as...
              </h2>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  number: 1,
                  title: "DISCOVER",
                  description: "Explore endless recipes that match your cravings",
                  icon: "🔍",
                  color: "from-cyan-500 to-cyan-700",
                  iconBg: "bg-cyan-100"
                },
                {
                  number: 2,
                  title: "CREATE",
                  description: "Follow simple steps and bring dishes to life",
                  icon: "👨‍🍳",
                  color: "from-orange-500 to-orange-700",
                  iconBg: "bg-orange-100"
                },
                {
                  number: 3,
                  title: "SHARE THE JOY",
                  description: "Inspire others by sharing your own recipes",
                  icon: "💝",
                  color: "from-pink-500 to-pink-700",
                  iconBg: "bg-pink-100"
                }
              ].map((step) => (
                <div
                  key={step.number}
                  className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {/* Step Number */}
                  <div className="flex items-center justify-center mb-6">
                    <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-white text-4xl font-bold">{step.number}</span>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="flex items-center justify-center mb-4">
                    <div className={`w-20 h-20 ${step.iconBg} rounded-full flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300`}>
                      <span className="text-4xl">{step.icon}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-3xl font-['Poppins'] font-bold text-gray-800 mb-4 text-center">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 font-['Poppins'] text-center leading-relaxed">
                    {step.description}
                  </p>

                  {/* Decorative Line */}
                  <div className="mt-6 flex justify-center">
                    <div className={`w-20 h-1 bg-gradient-to-r ${step.color} rounded-full`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Recipe Showcase Section */}
        <section className="w-full py-12 md:py-20 bg-cyan-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-['Pacifico'] text-cyan-800 mb-4 md:mb-6 [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)]">
                Your recipe haven awaits!
              </h2>
            </div>

            <div className="flex justify-center mb-6 md:mb-8">
              <img
                className="w-full max-w-6xl h-auto rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl"
                src="/images/landingpage3.png"
                alt="CookTopia Recipe Showcase"
              />
            </div>

            {/* Moved paragraph below the image */}
            <p className="text-lg md:text-xl lg:text-2xl text-gray-800 font-['Poppins'] text-center max-w-3xl mx-auto">
              Discover dishes that feel like home, no matter where you are
            </p>
          </div>
        </section>

        {/* Call to Action */}
        <section className="w-full flex flex-col bg-cyan-50 justify-center items-center gap-6 py-12 md:py-16 px-4">
          <h2 className="text-4xl text-cyan-800 md:text-6xl lg:text-8xl font-['Pacifico'] leading-tight md:leading-[155px] text-center drop-shadow-md">
            Ready to cook up something amazing?
          </h2>
          <p className="text-xl text-gray-800 md:text-2xl lg:text-3xl font-['Poppins'] text-center max-w-4xl px-4">
            Join CookTopia and start your culinary journey today.
          </p>

          <button 
            onClick={() => setRegisterModalOpen(true)}
            className="w-full sm:w-72 h-14 md:h-16 rounded-[20px] shadow-[4px_5px_4px_0px_rgba(0,0,0,0.29)] text-white text-xl md:text-2xl lg:text-3xl font-['Poppins'] transition-all duration-300 hover:scale-105 hover:shadow-[6px_7px_6px_0px_rgba(0,0,0,0.29)]" 
            style={{ backgroundColor: "#6BC4A6" }}
          >
            Let's Get Cooking!
          </button>
        </section>

        {/* Footer */}
        <footer className="w-full bg-cyan-50 flex flex-col justify-center items-center gap-6 p-6 md:p-12">
          <img className="w-48 md:w-64 lg:w-96 h-auto md:h-28 lg:h-36 object-contain" src="/images/cooktopialogo.png" alt="CookTopia Logo" />
          <p className="text-base md:text-lg text-gray-800 lg:text-2xl font-['Poppins'] text-center max-w-4xl px-4">
            Welcome to Cooktopia! Join our community of food lovers, home chefs, and culinary adventurers. Share recipes, discover new flavors, and make every meal special. Let's cook, create, and connect!
          </p>
          <nav className="flex gap-8 md:gap-12 lg:gap-16 text-xl md:text-2xl font-['Poppins'] flex-wrap justify-center">
            <div className="hover:text-cyan-800 text-gray-800 transition-colors duration-300 cursor-pointer">About</div>
            <div className="hover:text-cyan-800 text-gray-800 transition-colors duration-300 cursor-pointer">Contact</div>
            <div className="hover:text-cyan-800 text-gray-800 transition-colors duration-300 cursor-pointer">FAQ</div>
          </nav>
        </footer>
      </div>

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
    </>
  );
}

export default LandingPage;
