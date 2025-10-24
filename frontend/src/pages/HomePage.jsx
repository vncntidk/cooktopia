import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { logOut } from '../services/auth';
import { Link, useNavigate } from 'react-router-dom';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const name = user?.displayName || user?.email || 'Guest';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-2">Welcome, {name}</h1>
        <p className="text-gray-600 mb-6">You're signed in and verified.</p>
        
        <div className="space-y-4">
          <button
            onClick={logOut}
            className="w-full bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition-colors"
          >
            Log out
          </button>
          
          <p className="text-sm text-gray-500 text-center">
            Use the + button in the bottom-right corner to create a new recipe
          </p>
        </div>
      </div>
    </div>
  );
}

