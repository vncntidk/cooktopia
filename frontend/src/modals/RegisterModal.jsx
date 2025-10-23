import React, { useState } from 'react';
import { signUp, signInWithGoogle } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Logo from '../assets/LOGO FINAL.svg';

const RegisterModal = ({ isOpen, onClose, onSignIn = () => {} }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { reloadUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match.');
      }
      await signUp(email, password, displayName);
      toast.success('Registration successful! A verification email has been sent. Please check your inbox.');
      onClose();
    } catch (err) { 
      if (err.message.includes('email-already-in-use')) {
        toast.error('This email is already registered. Please use a different email or sign in.');
      } else if (err.message.includes('invalid-email')) {
        toast.error('Please enter a valid email address.');
      } else if (err.message.includes('weak-password')) {
        toast.error('Password should be at least 6 characters.');
      } else if (err.message.includes('operation-not-allowed')) {
        toast.error('Email/password accounts are not enabled. Please contact support.');
      } else if (err.message.includes('network-request-failed')) {
        toast.error('Network error. Please check your internet connection.');
      } else {
        toast.error(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      await reloadUser();
      toast.success('Registration successful!');
      onClose();
    } catch (err) {
      // Show specific error messages for Google auth
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

  const resetState = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setLoading(false);
  };

  const closeAndReset = () => {
    resetState();
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && email && password && confirmPassword && displayName && !loading) {
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
            className="w-[512px] min-w-64 pl-8 pr-4 py-7 bg-white rounded-[38px] inline-flex justify-start items-start gap-2.5 shadow-lg"
          >
            <div className="flex-1 flex justify-start items-start gap-2.5 flex-wrap content-start relative">
              {/* Close Button */}
              <button
                onClick={closeAndReset}
                aria-label="Close modal"
                className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 z-10"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="flex-1 inline-flex flex-col justify-start items-center gap-5">
                {/* Logo Section */}
                <div className="self-stretch p-2.5 inline-flex justify-start items-start gap-2.5 flex-wrap content-start">
                  <div className="flex-1 flex justify-center items-start">
                    <img className="flex-1 h-36 object-contain" src={Logo} alt="Cooktopia Logo" />
                  </div>
                </div>
                
                {/* Tagline */}
                <div className="self-stretch p-2.5 inline-flex justify-center items-center gap-2.5 flex-wrap content-center">
                  <div className="flex-1 min-w-48 text-center justify-end text-emerald-900 text-base font-normal font-['Poppins']">
                    Join our community of passionate cooks.
                  </div>
                </div>
                
                {/* Form Section */}
                <div className="w-full max-w-96 flex flex-col justify-start items-center gap-6">
                  <div className="self-stretch flex flex-col justify-start items-center gap-4">
                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                      {/* Display Name Input */}
                      <div className="self-stretch min-w-28 px-4 py-4 bg-white rounded-lg border border-gray-200 inline-flex justify-start items-center gap-2.5 flex-wrap content-center focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all duration-200 hover:border-gray-300">
                        <input
                          type="text"
                          placeholder="Display Name"
                          value={displayName}
                          onChange={e => setDisplayName(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="flex-1 justify-start text-gray-800 placeholder:text-gray-400 text-base font-medium font-['Geist'] bg-transparent border-none outline-none"
                          required
                        />
                      </div>
                      
                      {/* Email Input */}
                      <div className="self-stretch min-w-28 px-4 py-4 bg-white rounded-lg border border-gray-200 inline-flex justify-start items-center gap-2.5 flex-wrap content-center focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all duration-200 hover:border-gray-300">
                        <input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="flex-1 justify-start text-gray-800 placeholder:text-gray-400 text-base font-medium font-['Geist'] bg-transparent border-none outline-none"
                          required
                        />
                      </div>
                      
                      {/* Password Input */}
                      <div className="self-stretch min-w-28 px-4 py-4 bg-white rounded-lg border border-gray-200 inline-flex justify-start items-center gap-2.5 flex-wrap content-center focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all duration-200 hover:border-gray-300">
                        <input
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="flex-1 justify-start text-gray-800 placeholder:text-gray-400 text-base font-medium font-['Geist'] bg-transparent border-none outline-none"
                          required
                        />
                      </div>
                      
                      {/* Confirm Password Input */}
                      <div className="self-stretch min-w-28 px-4 py-4 bg-white rounded-lg border border-gray-200 inline-flex justify-start items-center gap-2.5 flex-wrap content-center focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all duration-200 hover:border-gray-300">
                        <input
                          type="password"
                          placeholder="Confirm Password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="flex-1 justify-start text-gray-800 placeholder:text-gray-400 text-base font-medium font-['Geist'] bg-transparent border-none outline-none"
                          required
                        />
                      </div>
                      
                      {/* Register Button */}
                      <button
                        type="submit"
                        className="self-stretch px-4 py-3 bg-orange-500 rounded-[20px] shadow-[4px_5px_4px_0px_rgba(0,0,0,0.29)] flex flex-col justify-center items-center gap-2.5 disabled:opacity-50 hover:bg-orange-600 active:shadow-[2px_3px_2px_0px_rgba(0,0,0,0.29)] active:translate-y-[2px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                        disabled={loading || !email || !password || !confirmPassword || !displayName}
                      >
                        <div className="self-stretch text-center justify-center text-white text-base font-semibold font-['Poppins']">
                          {loading ? 'Loading...' : 'Register'}
                        </div>
                      </button>
                    </form>
                    
                    {/* Google Sign In Button */}
                    <button
                      onClick={handleGoogle}
                      className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 px-4 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                      disabled={loading}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="font-medium font-['Poppins']">
                        {loading ? 'Loading...' : 'Continue with Google'}
                      </span>
                    </button>
                  </div>
                  
                  {/* Sign In Link */}
                  <div className="self-stretch inline-flex justify-center items-center gap-1.5 flex-wrap content-center">
                    <div className="flex-1 max-w-48 min-w-48 text-center justify-end text-emerald-900 text-base font-normal font-['Poppins']">
                      Already have an account?
                    </div>
                    <div className="flex-1 max-w-16 min-w-16 text-center justify-end">
                      <button 
                        type="button"
                        onClick={onSignIn}
                        className="text-orange-400 text-base font-normal font-['Poppins'] hover:text-orange-500 hover:underline transition-all focus:outline-none focus:underline"
                      >
                        Sign in
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

export default RegisterModal;
