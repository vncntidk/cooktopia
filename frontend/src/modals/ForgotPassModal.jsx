import React, { useState } from 'react';
import { resetPassword } from '../services/auth';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Logo from '../assets/LOGO FINAL.svg';

const ForgotPassModal = ({ isOpen, onClose, onSignIn = () => {} }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      toast.success('Password reset email sent. Check your inbox.');
      onClose();
    } catch (err) { 
      if (err.message.includes('user-not-found')) {
        toast.error('No account found with this email address.');
      } else if (err.message.includes('invalid-email')) {
        toast.error('Please enter a valid email address.');
      } else if (err.message.includes('too-many-requests')) {
        toast.error('Too many failed attempts. Please try again later.');
      } else if (err.message.includes('network-request-failed')) {
        toast.error('Network error. Please check your internet connection.');
      } else {
        toast.error(err.message || 'Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setEmail('');
    setLoading(false);
  };

  const closeAndReset = () => {
    resetState();
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && email && !loading) {
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
            className="w-[512px] min-w-64 h-[390px] pl-8 pr-4 py-7 bg-white rounded-[38px] inline-flex justify-start items-start gap-2.5 shadow-lg"
          >
            <div className="flex-1 flex justify-start items-start gap-3 flex-wrap content-start relative">
              {/* Close Button */}
              <button
                onClick={closeAndReset}
                aria-label="Close modal"
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 z-10"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    Reset your password to get back to cooking.
                  </div>
                </div>
                
                {/* Form Section */}
                <div className="w-full max-w-96 flex flex-col justify-start items-center gap-6">
                  <div className="self-stretch flex flex-col justify-start items-center gap-4">
                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                      {/* Email Input */}
                      <div className="self-stretch min-w-28 h-12 px-4 py-4 bg-white rounded-[20px] border border-gray-300 inline-flex justify-start items-center gap-2.5 flex-wrap content-center focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all duration-200 hover:border-gray-300">
                        <input
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="flex-1 justify-start text-gray-800 placeholder:text-gray-400 text-base font-medium font-['Geist'] bg-transparent border-none outline-none"
                          required
                          style={{ paddingLeft: '16px' }} 
                        />
                      </div>
                      
                      {/* Send Reset Email Button */}
                      <button
                        type="submit"
                        className="self-stretch px-4 py-3 h-12 bg-orange-500 rounded-[20px] shadow-[4px_5px_4px_0px_rgba(0,0,0,0.29)] flex flex-col justify-center items-center gap-2.5 disabled:opacity-50 hover:bg-orange-600 active:shadow-[2px_3px_2px_0px_rgba(0,0,0,0.29)] active:translate-y-[2px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                        disabled={loading || !email}
                      >
                        <div className="self-stretch text-center justify-center text-white text-base font-normal font-['Poppins']">
                          {loading ? 'Sending...' : 'Send Reset Email'}
                        </div>
                      </button>
                    </form>
                  </div>
                  
                {/* Back to Login Link */}
                  <div className="self-stretch inline-flex justify-center items-center gap-1.5">
                    <div className="text-center justify-end text-emerald-900 text-base font-normal font-['Poppins']">
                      Remember your password?
                    </div>
                    <div className="text-center justify-end">
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

export default ForgotPassModal;
