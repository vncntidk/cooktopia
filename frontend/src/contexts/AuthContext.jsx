import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChange } from '../services/auth';
import { auth } from '../config/firebase-config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setIsVerified(!!user?.emailVerified);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && !isVerified) {
      const checkVerificationStatus = async () => {
        try {
          await auth.currentUser.reload();
          const refreshed = auth.currentUser;
          if (refreshed?.emailVerified) {
            setUser(refreshed);
            setIsVerified(true);
          }
        } catch (error) {
          // Handle token expiration gracefully
          if (error.code === 'auth/user-token-expired') {
            console.log('User token expired, will be handled by auth state change');
            return;
          }
          console.error('Error checking verification status:', error);
        }
      };

      checkVerificationStatus();

      const verificationInterval = setInterval(checkVerificationStatus, 2000);

      return () => clearInterval(verificationInterval);
    }
  }, [user, isVerified]);

  const reloadUser = useCallback(async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const refreshed = auth.currentUser;
      setUser(refreshed);
      setIsVerified(!!refreshed?.emailVerified);
    }
  }, []);

  const checkEmailVerification = useCallback(async () => {
    if (auth.currentUser) {
      try {
        await auth.currentUser.reload();
        const refreshed = auth.currentUser;
        const verified = !!refreshed?.emailVerified;
        setUser(refreshed);
        setIsVerified(verified);
        return verified;
      } catch (error) {
        console.error('Error checking email verification:', error);
        return false;
      }
    }
    return false;
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isVerified,
    reloadUser,
    checkEmailVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


