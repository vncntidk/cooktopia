import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { getUserFollowersList, getUserFollowingList } from '../services/users';
import './FollowersFollowingModal.css';

/**
 * Modal component to display followers or following list
 * Similar to Instagram's followers/following modal
 */
export default function FollowersFollowingModal({ 
  isOpen, 
  onClose, 
  userId, 
  type // 'followers' or 'following'
}) {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch users list when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      setError('');
      setUsers([]);

      const fetchUsers = async () => {
        try {
          const userList = type === 'followers' 
            ? await getUserFollowersList(userId)
            : await getUserFollowingList(userId);
          setUsers(userList);
        } catch (err) {
          console.error(`Error fetching ${type}:`, err);
          setError(`Failed to load ${type}. Please try again.`);
        } finally {
          setLoading(false);
        }
      };

      fetchUsers();
    }
  }, [isOpen, userId, type]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle click outside modal
  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleUserClick = (targetUserId) => {
    onClose();
    navigate(`/profile/${targetUserId}`);
  };

  if (!isOpen) return null;

  const title = type === 'followers' ? 'Followers' : 'Following';

  return (
    <div 
      className="followers-modal-overlay"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div 
        className="followers-modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="followers-modal-title"
      >
        {/* Header */}
        <div className="followers-modal-header">
          <h2 id="followers-modal-title" className="followers-modal-title">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="followers-modal-close"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="followers-modal-content">
          {loading ? (
            <div className="followers-modal-loading">
              <div className="followers-modal-spinner" />
              <p>Loading {title.toLowerCase()}...</p>
            </div>
          ) : error ? (
            <div className="followers-modal-error">
              <p>{error}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="followers-modal-empty">
              <p>No {title.toLowerCase()} yet.</p>
            </div>
          ) : (
            <ul className="followers-modal-list">
              {users.map((user) => (
                <li key={user.userId} className="followers-modal-item">
                  <button
                    type="button"
                    onClick={() => handleUserClick(user.userId)}
                    className="followers-modal-user-button"
                  >
                    {/* Avatar */}
                    <div className="followers-modal-avatar-wrapper">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={`${user.displayName} profile`}
                          className="followers-modal-avatar"
                        />
                      ) : (
                        <div className="followers-modal-avatar followers-modal-avatar-placeholder">
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="followers-modal-user-info">
                      <p className="followers-modal-username">{user.displayName}</p>
                      {user.email && (
                        <p className="followers-modal-email">{user.email}</p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

