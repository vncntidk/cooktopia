import React, { useState } from 'react';
import { signIn, signInWithGoogle, sendVerificationEmail } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';

const LoginModal = ({ isOpen, onClose, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const { reloadUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');
    setVerificationSent(false);

    try {
      const user = await signIn(email, password);
      if (!user.emailVerified && !verificationSent) {
        try {
          await sendVerificationEmail();
          setVerificationSent(true);
          setInfo('A new verification email has been sent to your address. Please verify before logging in.');
        } catch (verificationErr) {
          setInfo('Your email is not verified. Please check your inbox for a verification email.');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    setInfo('');
    try {
      await signInWithGoogle();
      await reloadUser();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const closeAndReset = () => {
    setEmail('');
    setPassword('');
    setError('');
    setInfo('');
    setVerificationSent(false);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 bg-black/30 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Login</h2>
          <button
            onClick={closeAndReset}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          {info && (
            <div className="text-blue-700 text-sm bg-blue-50 p-2 rounded">
              {info}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
        
        <div className="mt-4">
          <button
            onClick={handleGoogle}
            className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Continue with Google'}
          </button>
        </div>

        <div className="mt-3 text-sm text-center">
          <button 
            onClick={onForgotPassword} 
            className="text-blue-600 hover:underline"
          >
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
