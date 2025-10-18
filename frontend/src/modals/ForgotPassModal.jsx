import React, { useState } from 'react';
import { resetPassword } from '../services/auth';

const ForgotPassModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setInfo('');
    setError('');
    try {
      await resetPassword(email);
      setInfo('Password reset email sent. Check your inbox.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset fields on close
  const closeAndReset = () => {
    setEmail('');
    setInfo('');
    setError('');
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 bg-black/30 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">Reset Password</h2>
          <button onClick={closeAndReset} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
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
            {loading ? 'Sending...' : 'Send Reset Email'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassModal;
