import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  deleteNotification, 
  listenToUserNotifications,
  markNotificationAsRead,
  // 💡 ADDED: Assuming this function exists in your services
  markAllNotificationsAsRead 
} from '../services/notifications';

const DEFAULT_USER_AVATAR = "/src/assets/Logo (2).png";

const NotificationModal = ({ isOpen, onClose, message = '' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [activeSubFilter, setActiveSubFilter] = useState("See All");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  // 💡 NEW STATE: Controls the visibility of the "More Options" dropdown
  const [isMenuOpen, setIsMenuOpen] = useState(false); 


  const name = user?.displayName || user?.email || 'Guest';

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Fetch notifications when modal opens - single listener per user
  useEffect(() => {
    if (!isOpen || !user?.uid) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    
    // Set up real-time listener - will be cleaned up on unmount or when dependencies change
    const unsubscribe = listenToUserNotifications(
      user.uid,
      (fetchedNotifications) => {
        setNotifications(fetchedNotifications);
        setLoading(false);
      },
      { limitCount: 50 }
    );

    return () => {
      unsubscribe();
    };
  }, [isOpen, user?.uid]);

  // Format timestamp to relative time
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    try {
      const now = new Date();
      const time = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isNaN(time.getTime())) return 'Just now';
      
      const diffMs = now - time;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Just now';
    }
  };

  // Format notification message based on type
  const formatNotificationMessage = (notification) => {
    const actorName = notification.actorName || 'Someone';
    
    switch (notification.type) {
      case 'follow':
        return 'just followed you.';
      case 'comment':
        const postTitle = notification.postTitle || 'your post';
        return `commented on your "${postTitle}" recipe.`;
      case 'like':
        const likePostTitle = notification.postTitle || 'your post';
        return `liked your post: "${likePostTitle}".`;
      case 'message_request':
        return 'sent you a message request.';
      default:
        return 'interacted with you.';
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      if (!notificationId) {
        return;
      }
      await deleteNotification(notificationId);
      // The real-time listener will update the list automatically
    } catch (error) {
      // Silent fail - don't break UX
    }
  };

  /**
   * Marks all unread notifications for the current user as read.
   */
  const handleMarkAllAsRead = async () => {
    setIsMenuOpen(false); // Close the menu immediately
    if (!user?.uid || !markAllNotificationsAsRead) {
      console.warn("User ID or markAllNotificationsAsRead function is missing.");
      return;
    }
    setLoading(true);
    try {
      await markAllNotificationsAsRead(user.uid);
      // Real-time listener will update the 'notifications' state automatically
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    } finally {
      setLoading(false);
    }
  };


  // Handle notification click - redirect based on type
  const handleNotificationClick = async (notification) => {
    if (!notification || !notification.id) {
      return;
    }

    // Mark notification as read when clicked (if not already read)
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
      } catch (error) {
        // Silent fail - continue with navigation even if mark fails
      }
    }

    switch (notification.type) {
      case 'like':
      case 'comment':
        // Open post modal by navigating to home with recipe ID in state
        if (notification.relatedPostId) {
          onClose();
          // Use a small delay to ensure modal closes first
          setTimeout(() => {
            navigate('/home', { 
              state: { openRecipeId: notification.relatedPostId } 
            });
          }, 100);
        }
        break;
      case 'follow':
        // Redirect to follower's profile
        if (notification.actorUserId) {
          onClose();
          navigate(`/profile/${notification.actorUserId}`);
        }
        break;
      case 'message_request':
        // Redirect to messages page (or specific conversation if messageThreadId is available)
        onClose();
        if (notification.messageThreadId) {
          navigate(`/messages?conversation=${notification.messageThreadId}`);
        } else {
          navigate('/messages');
        }
        break;
      default:
        // Do nothing for unknown types
        break;
    }
  };

  // Transform notifications to match UI structure
  const transformedNotifications = notifications.map((note) => {
    const timestamp = note.createdAt?.toDate ? note.createdAt.toDate().getTime() : 
                     (note.createdAt ? new Date(note.createdAt).getTime() : Date.now());
    
    // Use the read field directly from the notification data
    const isRead = note.read === true;
    
    return {
      id: note.id,
      type: note.type,
      title: note.actorName || 'User',
      message: formatNotificationMessage(note),
      avatar: note.actorAvatar || DEFAULT_USER_AVATAR,
      createdAt: formatTimestamp(note.createdAt),
      isRead: isRead,
      isNew: !isRead,
      originalTimestamp: timestamp,
      // Keep original data for navigation
      originalNotification: note,
    };
  });

  const filteredNotifications = transformedNotifications
    .slice()
    .sort((a, b) => b.originalTimestamp - a.originalTimestamp)
    .filter((note) => {
      const passesPrimaryFilter =
        activeTab === 'all' || (activeTab === 'unread' && !note.isRead);
      if (!passesPrimaryFilter) return false;

      const subFilter = activeSubFilter.toLowerCase().replace(' ', '');
      if (subFilter === 'seeall') return true;
      if (subFilter === 'new') return note.isNew;
      return true;
    });

  const notificationsToRender = filteredNotifications;
  
  // Check if there are any unread notifications to enable the "Mark All as Read" button
  const hasUnreadNotifications = notifications.some(n => !n.read);


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background Overlay */}
          <motion.div
            className="fixed bg-white/30 backdrop-blur-sm z-[9998]"
            style={{
              top: 0,
              left: 0,
              right: '64px',
              bottom: 0,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sliding Side Panel */}
          <motion.div
            className="fixed top-16 h-[calc(100vh-4rem)] right-0 z-[9999] w-96 max-w-[420px] min-w-[320px] bg-white shadow-2xl rounded-l-2xl p-6 border-b-2 border-gray-200 overflow-y-auto"
            style={{ top: '64px', right: '64px' }}
            initial={{ opacity: 0, scale: 0.8, originX: 1, originY: 0 }}
            animate={{ opacity: 1, scale: 1, originX: 1, originY: 0 }}
            exit={{ opacity: 0, scale: 0.8, originX: 1, originY: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 20 }}
          >
            <div className="flex justify-between items-center mb-4 relative h-10">
              <h1 className="absolute top-2 left-4 font-bold text-2xl font-Poppins">Notifications</h1>
              
              {/* 💡 MODIFIED: Options Menu Button */}
              <div className="absolute top-2 right-4 z-10">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-expanded={isMenuOpen}
                  aria-label="More notification options"
                  className="font-bold text-2xl font-Poppins text-gray-600 hover:text-orange-500 transition-colors"
                >
                  ...
                </button>
              
                {/* 💡 ADDED: Dropdown Menu for Mark All as Read */}
                {isMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 h-7 bg-white border border-gray-200 rounded-md shadow-lg py-1"
                    // Add an onClick handler to prevent clicks inside the menu from closing the modal via the overlay
                    onClick={(e) => e.stopPropagation()} 
                  >
                    <button
                      onClick={handleMarkAllAsRead}
                      disabled={loading || !hasUnreadNotifications}
                      className={`w-full text-left px-4 py-2 text-sm font-semibold transition-colors duration-200 
                        ${
                          loading || !hasUnreadNotifications
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-orange-500'
                        }`}
                        style={{marginLeft: 5}}
                    >
                      Mark all as Read
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-10"> 
            {/* All or Unread toggle */}
            <div className="flex gap-4 h-10 px-4 mb-4 relative">
              <button
                onClick={() => setActiveTab('all')}
                className={`absolute top-2 left-4 w-8 h-7 px-4 py-2 text-base font-Poppins transition-colors duration-300
                ${
                  activeTab === 'all'
                    ? 'text-orange-500 font-bold border-orange-500 border-b-2'
                    : 'text-black border-b-2 border-transparent hover:text-orange-500 hover:border-orange-300'
                }`}
              >
                All
              </button>

              <button
                onClick={() => setActiveTab('unread')}
                className={`absolute top-2 left-16 w-18 h-7 px-4 py-2 font-Poppins transition-colors duration-300 
                ${
                  activeTab === 'unread'
                    ? 'text-orange-500 font-bold border-orange-500 border-b-2'
                    : 'text-black border-b-2 border-transparent hover:text-orange-500 hover:border-orange-300'
                }`}
              >
                Unread
              </button>
            </div>
            </div>

            <div className="pt-2">
            {/* Sub-filters: New and See All */}
            <div className="flex gap-4 h-10 px-4 mb-4 relative">
              <button
                onClick={() => setActiveSubFilter('New')}
                className={`absolute top-2 left-4 w-8 h-7 px-4 py-2 text-base italic font-Poppins text-black-500 transition-colors duration-300
                ${
                  activeSubFilter === 'New'
                    ? 'font-bold'
                    : 'hover:font-bold'
                }`}
              >
                New
              </button>

              <button
                onClick={() => setActiveSubFilter('See All')}
                className={`absolute top-2 left-75 w-18 h-7 px-4 py-2 text-base font-Poppins text-orange-500 transition-colors duration-300
                ${
                  activeSubFilter === 'See All'
                    ? 'font-bold'
                    : 'hover:font-bold'
                }`}
              >
                See All
              </button>
            </div>
            </div>

            {/* Notifications List */}
            <div className="w-full flex flex-col gap-1 px-4 space-y-3">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading notifications...</div>
              ) : notificationsToRender.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No notifications</div>
              ) : (
                notificationsToRender.map((note) => {
                  const isUnread = !note.isRead;

                  return (
                    <div
                      key={note.id}
                      onClick={() => handleNotificationClick(note.originalNotification)}
                      className={`flex items-start gap-4 w-full
                        min-h-[80px] px-4 py-3 
                        border-b border-gray-100
                        hover:bg-gray-300 transition relative cursor-pointer
                        ${
                          isUnread
                            ? 'bg-gray-200'
                            : ''
                        }`}
                        >
                      <div className="flex-shrink-0">
                        <img
                          src={note.avatar || DEFAULT_USER_AVATAR}
                          alt={`${note.title}'s avatar`}
                          className="w-[50px] h-[50px] rounded-full object-cover border border-gray-300"
                          onError={(e) => {
                            // Fallback to default avatar if image fails to load
                            e.target.src = DEFAULT_USER_AVATAR;
                          }}
                          style={{marginLeft: 10, marginTop: 15}}
                        />
                      </div>
                          
                      <div className="flex-1 flex flex-col min-w-0"style={{marginTop: 12}}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm leading-relaxed break-words">
                              <span className="font-semibold">{note.title}</span>{' '}
                              <span className="text-gray-800">{note.message}</span>
                            </p>
                            <span className="text-gray-500 text-xs italic mt-1 block">
                              {note.createdAt}
                            </span>
                          </div>
                          
                          {/* Unread indicator and Delete button container */}
                          <div className="flex items-start gap-2 flex-shrink-0">
                            {isUnread && (
                              <div className="mt-1 w-[8px] h-[8px] rounded-full bg-orange-500 flex-shrink-0"style={{marginTop: 19}}></div>
                            )}
                            
                            {/* Delete button */}
                            <button
                              onClick={(e) => handleDeleteNotification(note.id, e)}
                              className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                              title="Delete notification"
                              aria-label="Delete notification"
                              style={{marginRight: 10}}
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-12 w-4" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationModal;