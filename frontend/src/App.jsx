import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
<<<<<<< HEAD
=======
import Messages from "./pages/Messages";
import ReactionsDemo from "./pages/ReactionsDemo";
>>>>>>> 253c05c37b3f7c59af0ea884aa593dbe6ca7fd60
import FloatingActionButton from './components/FloatingActionButton';
import AdminDashboard from './pages/AdminDashboard';
import AdminFeedbackReview from './pages/AdminFeedbackReview';
import AdminReportReview from './pages/AdminReportReview';
import AdminUser from './pages/AdminUser';
import AdminActivity from './pages/AdminActivity';
import { Toaster } from 'react-hot-toast';


import './App.css';
import CreateRecipe from './pages/CreateRecipe.jsx';
import Messages from './pages/Messages.jsx';
import ReactionsDemo from './pages/ReactionsDemo.jsx';
import ActivityLogs from './pages/ActivityLogs.jsx';
import SearchResults from './pages/SearchResults.jsx';


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
<<<<<<< HEAD
 
  const shouldShowFAB = location.pathname !== '/create-recipe' &&
  location.pathname !== '/messages' &&
  location.pathname !== '/reactions-demo' &&
  location.pathname !== '/activity-logs' &&
  location.pathname !== '/search' &&
  !location.pathname.startsWith('/admin');
=======
  
  const shouldShowFAB = location.pathname !== '/create-recipe' && location.pathname !== '/messages' && location.pathname !== '/reactions-demo';
>>>>>>> 253c05c37b3f7c59af0ea884aa593dbe6ca7fd60

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Protected><HomePage /></Protected>} />
        <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
<<<<<<< HEAD
        <Route path="/profile/:userId" element={<Protected><ProfilePage /></Protected>} />
        <Route path="/create-recipe" element={<Protected><CreateRecipe /></Protected>} />
        <Route path="/edit-recipe/:recipeId" element={<Protected><CreateRecipe /></Protected>} />
        <Route path="/messages" element={<Protected><Messages /></Protected>} />
        <Route path="/activity-logs" element={<Protected><ActivityLogs /></Protected>} />
        <Route path="/search" element={<Protected><SearchResults /></Protected>} />
        <Route path="/reactions-demo" element={<ReactionsDemo />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/reviews" element={<AdminFeedbackReview />} />
        <Route path="/admin/reviews/feedback" element={<AdminFeedbackReview />} />
        <Route path="/admin/reviews/report" element={<AdminReportReview />} />
        <Route path="/admin/users" element={<AdminUser />} />
        <Route path="/admin/activity" element={<AdminActivity />} />
=======
        <Route path="/create-recipe" element={<Protected><CreateRecipe /></Protected>} />
        <Route path="/messages" element={<Protected><Messages /></Protected>} />
        <Route path="/reactions-demo" element={<ReactionsDemo />} />
>>>>>>> 253c05c37b3f7c59af0ea884aa593dbe6ca7fd60
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