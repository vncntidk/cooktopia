import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';

import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Protected><HomePage /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
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
