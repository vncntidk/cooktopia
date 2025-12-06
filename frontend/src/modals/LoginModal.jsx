import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn, signInWithGoogle, sendVerificationEmail } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase-config';
import toast from 'react-hot-toast';
import Logo from '../assets/LOGO FINAL.svg';

const LoginModal = ({ isOpen = true, onClose = () => {}, onForgotPassword = () => {}, onSignUp = () => {} }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const { reloadUser } = useAuth();

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    
    setResendLoading(true);
    try {
      await sendVerificationEmail();
      setResendCooldown(60); // 60 second cooldown
      toast.success('Verification email resent successfully.');
    } catch (err) {
      if (err.message.includes('too-many-requests')) {
        toast.error('Too many requests. Please wait before requesting another verification email.');
        setResendCooldown(60);
      } else {
        toast.error('Failed to resend verification email. Please try again.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  const resetState = () => {
    setEmail('');
    setPassword('');
    setVerificationSent(false);
    setResendCooldown(0);
    setResendLoading(false);
    setLoading(false);
  };

  const closeAndReset = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setVerificationSent(false);

    try {
      // First, sign out any currently logged-in account (admin or non-admin)
      try {
        await signOut(auth);
      } catch (error) {
        console.error('Error signing out previous account:', error);
      }

      // Then sign in as non-admin user
      const user = await signIn(email, password);
      
      // Check if user is verified
      if (!user.emailVerified) {
        toast.error('Please verify your email before logging in. Check your inbox for a verification email.');
        setVerificationSent(true);
        return;
      }
      
      // User is verified, proceed with login
      await reloadUser();
      toast.success('Login successful!');
      onClose();
    } catch (err) {
      if (err.message.includes('user-not-found')) {
        toast.error('No account found with this email address.');
      } else if (err.message.includes('wrong-password')) {
        toast.error('Incorrect password. Please try again.');
      } else if (err.message.includes('invalid-email')) {
        toast.error('Please enter a valid email address.');
      } else if (err.message.includes('too-many-requests')) {
        toast.error('Too many failed attempts. Please try again later.');
      } else if (err.message.includes('user-disabled')) {
        toast.error('This account has been disabled. Please contact support.');
      } else if (err.message.includes('network-request-failed')) {
        toast.error('Network error. Please check your internet connection.');
      } else {
        toast.error(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      // First, sign out any currently logged-in account (admin or non-admin)
      try {
        await signOut(auth);
      } catch (error) {
        console.error('Error signing out previous account:', error);
      }

      // Then sign in with Google
      await signInWithGoogle();
      await reloadUser();
      toast.success('Login successful!');
      onClose();
    } catch (err) {
      
      if (err.message.includes('popup-closed-by-user')) {
        toast.error('Sign-in was cancelled.');
      } else if (err.message.includes('popup-blocked')) {
        toast.error('Popup was blocked. Please allow popups for this site.');
      } else if (err.message.includes('network-request-failed')) {
        toast.error('Network error. Please check your internet connection.');
      } else {
        toast.error(err.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && email && password && !loading) {
      handleSubmit(e);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAndReset}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-[550px] min-w-64 h-[645px] pl-10 pr-6 py-8 bg-white rounded-[38px] inline-flex justify-start items-start gap-3 shadow-lg" // Increased width and padding
          >
            <div className="flex-1 flex justify-start items-start gap-3 flex-wrap content-start relative">
              {/* Close Button */}
              <button
                onClick={closeAndReset}
                aria-label="Close modal"
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 z-10" // Increased size
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> {/* Increased icon size */}
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="flex-1 inline-flex flex-col justify-start items-center gap-6"> {/* Increased gap */}
                {/* Logo Section */}
                <div className="self-stretch p-3 inline-flex justify-start items-start gap-3 flex-wrap content-start"> {/* Increased padding */}
                  <div className="flex-1 flex justify-center items-start">
                    <img className="flex-1 h-40 object-contain" src={Logo} alt="Cooktopia Logo" /> {/* Increased logo size */}
                  </div>
                </div>
                
                {/* Tagline */}
                <div className="self-stretch p-3 inline-flex justify-center items-center gap-3 flex-wrap content-center"> {/* Increased padding */}
                  <div className="flex-1 min-w-48 text-center justify-end text-emerald-900 text-lg font-normal font-['Poppins']"> {/* Increased text size */}
                    Taste the joy of cooking, one recipe at a time.
                  </div>
                </div>
                
                {/* Form Section */}
                <div className="w-full max-w-[460px] flex flex-col justify-start items-center gap-8"> {/* Increased max-width and gap */}
                  <div className="self-stretch flex flex-col justify-start items-center gap-5"> {/* Increased gap */}
                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6"> {/* Increased gap */}
                        {/* Email Input */}
                        <div className="self-stretch min-w-32 h-12 px-5 py-5 bg-white rounded-[20px] border border-gray-300 inline-flex justify-start items-center gap-3 flex-wrap content-center focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all duration-200 hover:border-gray-300"> {/* Increased padding */}
                          <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-1 justify-start text-gray-800 placeholder:text-gray-400 text-lg font-normal font-['Geist'] bg-transparent border-none outline-none" // Increased text size
                            style={{ paddingLeft: '16px' }} 
                          />
                        </div>
                        
                        {/* Password Section */}
                        <div className="self-stretch flex flex-col justify-start items-start gap-3"> {/* Increased gap */}
                        <div className="self-stretch min-w-32 h-12 px-5 py-5 bg-white rounded-[20px] border border-gray-300 inline-flex justify-start items-center gap-3 flex-wrap content-center focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all duration-200 hover:border-gray-300"> {/* Increased padding */}
                          <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-1 justify-start text-gray-800 placeholder:text-gray-400 text-lg font-normal font-['Geist'] bg-transparent border-none outline-none" 
                            style={{ paddingLeft: '16px' }} // Added pl-2 for left padding to move placeholder right
                          />
                        </div>

                          <div className="self-stretch flex justify-start items-center">
                            <button 
                              type="button"
                              onClick={onForgotPassword} 
                              className="text-emerald-900 text-base font-normal font-['Poppins'] hover:underline transition-all hover:text-emerald-700 focus:outline-none focus:underline" // Increased text size
                               style={{ paddingLeft: '16px' }}                             
                           >
                              Forgot Password?
                            </button>
                          </div>
                        </div>
                      
                        {/* Login Button */}
                        <button
                          type="submit"
                          className="self-stretch px-5 py-4 h-12 bg-[#FA6B0C] rounded-[20px] shadow-[4px_5px_4px_0px_rgba(0,0,0,0.29)] flex flex-col justify-center items-center gap-3 disabled:opacity-50 hover:bg-orange-600 active:shadow-[2px_3px_2px_0px_rgba(0,0,0,0.29)] active:translate-y-[2px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2" // Increased padding
                          disabled={loading || !email || !password}
                        >
                          <div className="self-stretch text-center justify-center text-white text-lg font-['Poppins']"> {/* Increased text size */}
                            {loading ? 'Loading...' : 'Login'}
                          </div>
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative flex items-center w-full my-2">
                      <div className="flex-grow border-t border-gray-300"></div>
                      <span className="flex-shrink mx-4 text-gray-500 text-sm font-medium font-['Poppins']">or</span>
                      <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                    
                    {/* Google Sign In Button */}
                    <button
                      onClick={handleGoogle}
                      className="w-full h-12 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3.5 px-5 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-4 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2" // Increased padding
                      disabled={loading}
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24"> {/* Increased icon size */}
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="font-medium font-['Poppins'] text-base"> {/* Increased text size */}
                        {loading ? 'Loading...' : 'Continue with Google'}
                      </span>
                    </button>
                  </div>
                  
                  {/* Verification Reminder */}
                  {verificationSent && (
                    <div className="w-full p-5 bg-orange-50 border border-orange-200 rounded-lg"> {/* Increased padding */}
                      <div className="flex items-start gap-4"> {/* Increased gap */}
                        <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"> {/* Increased size */}
                          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"> {/* Increased icon size */}
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-orange-800 font-['Poppins'] mb-2"> {/* Increased text size */}
                            Email Verification Required
                          </h3>
                          <p className="text-base text-orange-700 font-['Poppins'] mb-3"> {/* Increased text size */}
                            Please check your inbox and click the verification link to activate your account.
                          </p>
                          <button
                            onClick={handleResendVerification}
                            disabled={resendCooldown > 0 || resendLoading}
                            className="text-base text-orange-600 hover:text-orange-700 font-medium font-['Poppins'] hover:underline transition-all focus:outline-none focus:underline disabled:opacity-50" // Increased text size
                          >
                            {resendLoading ? 'Sending...' : 
                             resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 
                             'Resend Verification Email'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Sign Up Link */}
                  <div className="self-stretch inline-flex justify-center items-center gap-1.5 flex-wrap content-center">
                  <div className="flex-1 max-w-48 min-w-48 text-center justify-end text-emerald-900 text-base font-normal font-['Poppins']">
                      Don't have an account?
                    </div>
                    <div className="flex-1 max-w-16 min-w-16 text-center justify-end">
                      <button 
                        type="button"
                        onClick={onSignUp}
                        className="text-orange-400 text-base font-normal font-['Poppins'] hover:text-orange-500 hover:underline transition-all focus:outline-none focus:underline"                      >
                        Sign up
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;