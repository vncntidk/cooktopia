import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_USER_AVATAR = "/src/assets/Logo (2).png";

const NotificationModal = ({ isOpen, onClose, message = '' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [activeSubFilter, setActiveSubFilter] = useState("See All");

  const name = user?.displayName || user?.email || 'Guest';

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  {/* Static message */}
  const staticNotifications = [
    {
      id: '1',
      type: 'follow',
      title: 'Tanya Lopez',
      message: 'just followed you.',
      avatar: '/src/assets/tanya.jpg',
      createdAt: '3 min ago',
      isRead: false,
      isNew: true,
      originalTimestamp: Date.now() - 3 * 60 * 1000,
    },
    {
      id: '2',
      type: 'comment',
      title: 'Katik G',
      message: 'commented on your "Sotanghon" recipe.',
      avatar: '/src/assets/katik.jpg',
      createdAt: '1 hr ago',
      isRead: false,
      isNew: true,
      originalTimestamp: Date.now() - 60 * 60 * 1000,
    },
    {
      id: '3',
      type: 'follow',
      title: 'Peppa Pig',
      message: 'followed you.',
      avatar: '/src/assets/peppa.jpeg',
      createdAt: '2 hr ago',
      isRead: false,
      isNew: true,
      originalTimestamp: Date.now() - 120 * 60 * 1000,
    },
    {
      id: '4',
      type: 'like',
      title: 'Peppa Pig',
      message: 'liked your post: "Tinolang Adobo Recipe".',
      avatar: '/src/assets/peppa.jpeg',
      createdAt: '2 hrs ago',
      isRead: true,
      isNew: true,
      originalTimestamp: Date.now() - 120 * 60 * 1000,
    },
    {
      id: '5',
      type: 'mention',
      title: 'Sassa Ghurl',
      message: 'mentioned you in her comment',
      avatar: '/src/assets/sassa.jpeg',
      createdAt: '5 days ago',
      isRead: true,
      isNew: false,
      originalTimestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
    },
  ];

  {/* Welcome Message */}
  const welcomeNotification = (name) => ({
    id: 'welcome',
    type: 'welcome',
    title: '',
    message: `Welcome ${name} to Cooktopia!`,
    avatar: '/src/assets/Logo (2).png',
    createdAt: '1 week ago',
    isRead: true,
    isNew: false,
    originalTimestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
  });

  const filteredNotifications = staticNotifications
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

  const normalizedSubFilter = activeSubFilter.toLowerCase().replace(' ', '');
  const shouldShowWelcome = activeTab === 'all' && normalizedSubFilter === 'seeall';
  const notificationsToRender = shouldShowWelcome
    ? [...filteredNotifications, welcomeNotification(name)] : filteredNotifications;


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
            className="fixed top-16 h-[calc(100vh-4rem)] right-0 z-[9999] w-80 bg-white shadow-2xl rounded-l-2xl p-6 border-b-2 border-gray-200 overflow-y-auto"
            style={{ top: '64px', right: '64px' }}
            initial={{ opacity: 0, scale: 0.8, originX: 1, originY: 0 }}
            animate={{ opacity: 1, scale: 1, originX: 1, originY: 0 }}
            exit={{ opacity: 0, scale: 0.8, originX: 1, originY: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 20 }}
          >
            <div className="flex justify-between items-center mb-4 relative h-10">
              <h1 className="absolute top-2 left-4 font-bold text-2xl font-Poppins">Notifications</h1>
              <h2 className="absolute top-2 left-70 font-bold text-2xl font-Poppins">...</h2>
            </div>

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
                className={`absolute top-2 left-60 w-18 h-7 px-4 py-2 text-base font-Poppins text-orange-500 transition-colors duration-300
                ${
                  activeSubFilter === 'See All'
                    ? 'font-bold'
                    : 'hover:font-bold'
                }`}
              >
                See All
              </button>
            </div>

            {/* Notifications List */}
            <div className="w-full flex flex-col gap-1 px-4 space-y-3">
              {notificationsToRender.map((note) => {
                const isUnread = !note.isRead;

                return (
                  <div
                    key={note.id}
                    className={`flex items-center gap-4 w-full max-w-[600px]
                      h-[80px] px-4 py-3 
                      border border-gray-200 rounded-xl
                      hover:bg-gray-300 transition mx-auto
                      ${
                        isUnread
                          ? 'bg-gray-200'
                          : 'bg-gray-100'
                      }`}>
                    <div className="flex-shrink-0 ml-2">
                      <img
                        src={note.avatar || DEFAULT_USER_AVATAR}
                        alt="Avatar"
                        className="w-[50px] h-[50px] rounded-full object-cover border border-gray-300"/>
                    </div>
                        
                    <div className="flex flex-col w-full overflow-hidden">
                      {isUnread && (
                          <div className="ml-2 inline-block mt-[2px] relative left-60">
                          <div className=" top-2 w-[8px] h-[8px] rounded-full bg-orange-500"></div>
                          </div>)}
                      
                      <p className="text-sm truncate">
                        <span className="font-semibold">{note.title}</span>{' '}
                        <span className="text-gray-800">{note.message}</span>
                      </p>
                      <span className="text-gray-500 text-xs italic">
                        {note.createdAt}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationModal;
