import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../modals/AuthModal';

export default function LandingPage() {
  
  const [modalOpen, setModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const { user, isAuthenticated, loading } = useAuth();

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
        <div className="space-y-3">
          <button 
            onClick={() => { setModalOpen(true); setAuthMode('login'); }} 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
          >
            Login
          </button>
          <button 
            onClick={() => { setModalOpen(true); setAuthMode('register'); }} 
            className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors"
          >
            Register
          </button>
        </div>
      </div>

      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={authMode}
      />
    </div>
  );
}
