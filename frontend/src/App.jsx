import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import CreateRecipe from './pages/CreateRecipe';
import FloatingActionButton from './components/FloatingActionButton';
import { Toaster } from 'react-hot-toast';

import { useState } from 'react'
import './App.css'
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";

import LandingPage from './pages/LandingPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

function AppContent() {
  const location = useLocation();
  
  // Hide FAB on create-recipe page
  const shouldShowFAB = location.pathname !== '/create-recipe';

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Protected><HomePage /></Protected>} />
        <Route path="/create-recipe" element={<Protected><CreateRecipe /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Global Floating Action Button - Hidden on create-recipe page */}
      {shouldShowFAB && <FloatingActionButton />}
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
    <div>
      <LandingPage />
    </div>
  )
}

export default App

function Protected({ children }) {
  const { loading, isAuthenticated, isVerified } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (!isVerified) {
    return <Navigate to="/" replace state={{ needsVerification: true }} />
  }

  return children;
}
