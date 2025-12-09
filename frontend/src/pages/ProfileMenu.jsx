import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logOut } from '../services/auth';

const ProfileMenu = ({ isOpen, onClose, profileRef }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  
  // Check if currently on profile page
  const isOnProfilePage = location.pathname === '/profile' || location.pathname.startsWith('/profile/');

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, profileRef]);

  // Handle escape key to close dropdown
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleLogOut = () => {
    logOut();
    onClose();
  };

  const handleViewProfile = () => {
    navigate('/profile');
    onClose();
  };

  const handleSupportCenter = () => {
    // Support Center handles both feedback and issue reporting
    console.log('Support Center clicked - handles both feedback and issue reporting');
  };

  const menuItems = [
    { id: 'view-profile', label: 'View Profile', action: handleViewProfile },
    { id: 'support-center', label: 'Support Center', action: handleSupportCenter },
    { id: 'logout', label: 'Log Out', action: handleLogOut, isLast: true }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-16 right-0 w-56 bg-white rounded-xl shadow-lg overflow-hidden z-50"
          style={{
            boxShadow: '5px 5px 4px 0px rgba(0,0,0,0.25)',
            animation: 'fadeInSlideDown 0.2s ease-out forwards'
          }}
        >
          {menuItems.map((item, index) => (
            <button
              key={item.id}
              onClick={item.action}
              className={`w-full h-14 p-2.5 flex items-center justify-center gap-2.5 transition-colors duration-150 ${
                item.id === 'view-profile' && isOnProfilePage
                  ? 'bg-orange-300 hover:bg-orange-400' 
                  : 'bg-white hover:bg-gray-100'
              } ${item.isLast ? 'border-t border-gray-200' : ''}`}
            >
              <div className="text-black text-xl font-medium font-['Inter'] leading-5">
                {item.label}
              </div>
            </button>
          ))}
        </div>
      )}

    </>
  );
};

export default ProfileMenu;
