import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const FloatingActionButton = ({ 
  onClick, 
  className = '', 
  size = 'large',
  variant = 'primary',
  disabled = false,
  tooltip = 'Create Recipe'
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, isVerified } = useAuth();

  // Don't show FAB if user is not authenticated and verified
  if (!isAuthenticated || !isVerified) {
    return null;
  }

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior: navigate to create recipe
      navigate('/create-recipe');
    }
  };

  // Size variants
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-14 h-14',
    large: 'w-16 h-16'
  };

  // Color variants
  const variantClasses = {
    primary: 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700',
    secondary: 'bg-gray-600 hover:bg-gray-700 active:bg-gray-800',
    success: 'bg-green-500 hover:bg-green-600 active:bg-green-700',
    danger: 'bg-red-500 hover:bg-red-600 active:bg-red-700'
  };

  // Icon sizes based on button size
  const iconSizes = {
    small: 'w-5 h-5',
    medium: 'w-6 h-6',
    large: 'w-7 h-7'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tooltip */}
      <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-200">
        {tooltip}
        <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
      </div>

      {/* FAB Button */}
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
          rounded-full
          flex
          items-center
          justify-center
          text-white
          font-medium
          shadow-lg
          hover:shadow-xl
          hover:scale-105
          active:shadow-md
          active:scale-95
          transition-all
          duration-200
          focus:outline-none
          focus:ring-4
          focus:ring-orange-200
          focus:ring-opacity-50
          select-none
        `}
        aria-label={tooltip}
        role="button"
        tabIndex={disabled ? -1 : 0}
        type="button"
      >
        {/* Plus Icon */}
        <svg
          className={`${iconSizes[size]} transition-transform duration-200 hover:rotate-90`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

    </div>
  );
};

export default FloatingActionButton;
