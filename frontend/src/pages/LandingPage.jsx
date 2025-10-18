import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from '../modals/LoginModal';
import RegisterModal from '../modals/RegisterModal';
import ForgotPassModal from '../modals/ForgotPassModal';
import { useNavigate, useLocation } from 'react-router-dom';
import { sendVerificationEmail } from '../services/auth';

export default function LandingPage() {
  
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
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 z-10"> 
        <h1 className="text-2xl font-bold text-center mb-4">Welcome to Cooktopia!</h1>
        <p className="text-gray-600 text-center mb-6">
          Your culinary journey starts here
        </p>
        {isAuthenticated && !isVerified && (
          <div className="mb-4 text-sm">
            <div className="bg-yellow-50 text-yellow-800 p-3 rounded mb-2">
              {notice || 'Your email is not verified. Please check your inbox and click the verification link. You will be automatically logged in once verified.'}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  setSending(true);
                  setNotice('');
                  try {
                    await sendVerificationEmail();
                    setNotice('Verification email sent. Check your inbox.');
                  } catch (e) {
                    setNotice(e.message);
                  } finally {
                    setSending(false);
                  }
                }}
                className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Resend verification email'}
              </button>
            </div>
          </div>
        )}
        <div className="space-y-3">
          <button 
            onClick={() => setLoginModalOpen(true)} 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
          >
            Login
          </button>
          <button 
            onClick={() => setRegisterModalOpen(true)} 
            className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors"
          >
            Register
          </button>
        </div>
      </div>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onForgotPassword={() => {
          setLoginModalOpen(false);
          setForgotPassModalOpen(true);
        }}
      />
      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
      <ForgotPassModal
        isOpen={forgotPassModalOpen}
        onClose={() => setForgotPassModalOpen(false)}
      />
    </div>
  );
}
