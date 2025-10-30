import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import FloatingActionButton from './components/FloatingActionButton';
import { Toaster } from 'react-hot-toast';

import './App.css';
import CreateRecipe from './pages/CreateRecipe.jsx';
import Messages from './pages/Messages.jsx';
import ReactionsDemo from './pages/ReactionsDemo.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const location = useLocation();
  
  const shouldShowFAB = location.pathname !== '/create-recipe' && location.pathname !== '/messages' && location.pathname !== '/reactions-demo';

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Protected><HomePage /></Protected>} />
        <Route path="/create-recipe" element={<Protected><CreateRecipe /></Protected>} />
        <Route path="/messages" element={<Protected><Messages /></Protected>} />
        <Route path="/reactions-demo" element={<ReactionsDemo />} />
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
}

function Protected({ children }) {
  const { loading, isAuthenticated, isVerified } = useAuth();

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

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!isVerified) {
    return <Navigate to="/" replace state={{ needsVerification: true }} />;
  }

  return children;
}

export default App;