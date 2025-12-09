import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { signIn } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import Logo from '../assets/LOGO FINAL.svg';

const AdminLoginModal = ({ isOpen = true, onClose = () => {} }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { reloadUser, logoutNonAdminUser } = useAuth();

  const resetState = () => {
    setEmail('');
    setPassword('');
    setLoading(false);
  };

  const closeAndReset = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await logoutNonAdminUser();

      const user = await signIn(email, password);
      
      await reloadUser();
      toast.success('Login successful!');
      onClose();
      navigate("/admin");
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
                        </div>
                      
                        {/* Login Button */}
                        <button
                          type="submit"
                          className="self-stretch px-5 py-4 h-12 bg-[#6BC4A6] rounded-[20px] shadow-[4px_5px_4px_0px_rgba(0,0,0,0.29)] flex flex-col justify-center items-center gap-3 disabled:opacity-50 hover:scale-105 active:shadow-[2px_3px_2px_0px_rgba(0,0,0,0.29)] active:translate-y-[2px] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                          disabled={loading || !email || !password}
                        >
                          <div className="self-stretch text-center justify-center text-white text-lg font-['Poppins']"> {/* Increased text size */}
                            {loading ? 'Loading...' : 'Login'}
                          </div>
                        </button>
                    </form>
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

export default AdminLoginModal;