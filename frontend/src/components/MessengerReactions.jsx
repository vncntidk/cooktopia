import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmilePlus } from 'lucide-react';
import '../styles/messages.css';

const MessengerReactions = ({ messageId, reactions: initialReactions, onReactionUpdate }) => {
  const [showTray, setShowTray] = useState(false);
  const [userReaction, setUserReaction] = useState(null);
  const [reactions, setReactions] = useState(initialReactions || {});
  const triggerRef = useRef(null);
  const trayRef = useRef(null);

  // Sync reactions with prop changes (from Firestore updates)
  useEffect(() => {
    if (initialReactions) {
      setReactions(initialReactions);
    }
  }, [initialReactions]);

  const emojiOptions = [
    { id: 'heart', emoji: '❤️', label: 'Heart', color: 'bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 dark:hover:bg-rose-900' },
    { id: 'appetite', emoji: '😋', label: 'Hungry', color: 'bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 dark:hover:bg-amber-900' },
    { id: 'angry', emoji: '😡', label: 'Angry', color: 'bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900' },
    { id: 'sad', emoji: '😢', label: 'Sad', color: 'bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900' },
    { id: 'like', emoji: '👍', label: 'Like', color: 'bg-green-50 dark:bg-green-950 hover:bg-green-100 dark:hover:bg-green-900' },
    { id: 'yeah', emoji: '😎', label: 'Yeah', color: 'bg-yellow-50 dark:bg-yellow-950 hover:bg-yellow-100 dark:hover:bg-yellow-900' },
  ];

  // Close tray when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (trayRef.current && !trayRef.current.contains(event.target) &&
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        setShowTray(false);
      }
    };

    if (showTray) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showTray]);

  const handleReactionClick = (emojiId) => {
    const newReactions = { ...reactions };
    
    // If user clicks the same emoji, remove their reaction
    if (userReaction === emojiId) {
      newReactions[emojiId] = Math.max(0, (newReactions[emojiId] || 0) - 1);
      setUserReaction(null);
    } else {
      // Add new reaction (remove previous user reaction if exists)
      if (userReaction && userReaction !== emojiId && newReactions[userReaction] > 0) {
        newReactions[userReaction] = Math.max(0, newReactions[userReaction] - 1);
      }
      newReactions[emojiId] = (newReactions[emojiId] || 0) + 1;
      setUserReaction(emojiId);
    }

    setReactions(newReactions);
    
    // Update parent component
    if (onReactionUpdate) {
      onReactionUpdate(messageId, emojiId, newReactions);
    }

    // Close tray after selection
    setTimeout(() => setShowTray(false), 200);
  };

  return (
    <div className="messages-reactions-container">
      {/* Reaction Trigger Icon */}
      <button
        ref={triggerRef}
        onClick={() => setShowTray(!showTray)}
        className="messages-reaction-trigger"
        aria-label="Add reaction"
      >
        <SmilePlus className="messages-reaction-icon" />
      </button>

      {/* Existing Reactions Display */}
      {Object.entries(reactions).some(([_, count]) => count > 0) && (
        <div className="messenger-reactions-list">
          {emojiOptions.map(({ id, emoji, label }) => {
            const count = reactions[id] || 0;
            if (count === 0) return null;

            return (
              <motion.button
                key={id}
                onClick={() => handleReactionClick(id)}
                className={`messenger-reaction-badge ${userReaction === id ? 'active' : ''}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`${label}: ${count}`}
              >
                <span className="messenger-reaction-emoji">{emoji}</span>
                {count > 1 && (
                  <span className="messenger-reaction-count">
                    {count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Emoji Tray Popover */}
      <AnimatePresence>
        {showTray && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="messages-reaction-backdrop"
              onClick={() => setShowTray(false)}
            />
            
            {/* Tray */}
            <motion.div
              ref={trayRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="messages-reaction-tray"
            >
              <div className="messages-reaction-tray-content">
                {emojiOptions.map(({ id, emoji, label }) => (
                  <motion.button
                    key={id}
                    onClick={() => handleReactionClick(id)}
                    className={`messages-reaction-tray-button ${userReaction === id ? 'active' : ''}`}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={label}
                  >
                    <span className="messages-reaction-tray-emoji" role="img" aria-label={label}>
                      {emoji}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessengerReactions;

