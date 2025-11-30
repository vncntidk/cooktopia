import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Utensils, 
  Angry, 
  Frown, 
  ThumbsUp, 
  PartyPopper 
} from 'lucide-react';

const ReactionButtons = ({ reactions: reactionCounts = {}, onReactionClick, messageId }) => {
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [hoveredReaction, setHoveredReaction] = useState(null);

  const reactions = [
    { 
      id: 'heart', 
      icon: Heart, 
      label: 'Heart', 
      color: 'rose',
      bgClass: 'bg-rose-50 dark:bg-rose-950',
      hoverClass: 'hover:bg-rose-100 dark:hover:bg-rose-900',
      iconColor: 'text-rose-500',
      borderColor: 'border-rose-300 dark:border-rose-700'
    },
    { 
      id: 'appetite', 
      icon: Utensils, 
      label: 'Hungry', 
      color: 'amber',
      bgClass: 'bg-amber-50 dark:bg-amber-950',
      hoverClass: 'hover:bg-amber-100 dark:hover:bg-amber-900',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-300 dark:border-amber-700'
    },
    { 
      id: 'angry', 
      icon: Angry, 
      label: 'Angry', 
      color: 'red',
      bgClass: 'bg-red-50 dark:bg-red-950',
      hoverClass: 'hover:bg-red-100 dark:hover:bg-red-900',
      iconColor: 'text-red-600',
      borderColor: 'border-red-300 dark:border-red-700'
    },
    { 
      id: 'sad', 
      icon: Frown, 
      label: 'Sad', 
      color: 'blue',
      bgClass: 'bg-blue-50 dark:bg-blue-950',
      hoverClass: 'hover:bg-blue-100 dark:hover:bg-blue-900',
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-300 dark:border-blue-700'
    },
    { 
      id: 'like', 
      icon: ThumbsUp, 
      label: 'Like', 
      color: 'green',
      bgClass: 'bg-green-50 dark:bg-green-950',
      hoverClass: 'hover:bg-green-100 dark:hover:bg-green-900',
      iconColor: 'text-green-600',
      borderColor: 'border-green-300 dark:border-green-700'
    },
    { 
      id: 'yeah', 
      icon: PartyPopper, 
      label: 'Yeah!', 
      color: 'yellow',
      bgClass: 'bg-yellow-50 dark:bg-yellow-950',
      hoverClass: 'hover:bg-yellow-100 dark:hover:bg-yellow-900',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-300 dark:border-yellow-700'
    },
  ];

  const handleReactionClick = (reactionId) => {
    const newState = reactionId === selectedReaction ? null : reactionId;
    setSelectedReaction(newState);
    
    // Call the parent's reaction handler if provided
    if (onReactionClick && messageId) {
      onReactionClick(messageId, reactionId, newState !== null);
    }
  };

  // Animation variants for the button
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.1,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    },
    tap: { 
      scale: 0.95,
      transition: { 
        duration: 0.1 
      }
    },
    selected: {
      scale: 1.15,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 15
      }
    }
  };

  // Icon animation variants
  const iconVariants = {
    initial: { rotate: 0 },
    hover: { rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } },
    selected: { rotate: [0, 15, -15, 0], transition: { duration: 0.6 } }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-1 md:gap-2">
      {reactions.map((reaction) => {
        const Icon = reaction.icon;
        const isSelected = selectedReaction === reaction.id;
        const isHovered = hoveredReaction === reaction.id;
        const count = reactionCounts[reaction.id] || 0;

        return (
          <motion.button
            key={reaction.id}
            className={`
              relative flex items-center justify-center gap-1
              px-2 md:px-3 py-1.5 md:py-2
              rounded-lg md:rounded-xl
              border transition-all duration-200
              ${reaction.bgClass}
              ${reaction.hoverClass}
              ${reaction.borderColor}
              ${isSelected ? 'shadow-md' : 'shadow-sm'}
            `}
            aria-label={`React with ${reaction.label}`}
            onMouseEnter={() => setHoveredReaction(reaction.id)}
            onMouseLeave={() => setHoveredReaction(null)}
            onClick={() => handleReactionClick(reaction.id)}
            variants={buttonVariants}
            initial="initial"
            animate={isSelected ? 'selected' : isHovered ? 'hover' : 'initial'}
            whileHover="hover"
            whileTap="tap"
          >
            {/* Icon with animation */}
            <motion.div
              variants={iconVariants}
              animate={isSelected ? 'selected' : isHovered ? 'hover' : 'initial'}
            >
              <Icon 
                className={`
                  w-4 h-4 md:w-5 md:h-5
                  ${reaction.iconColor}
                  transition-colors duration-200
                `}
                strokeWidth={2.5}
              />
            </motion.div>

            {/* Count badge - only show if > 0 */}
            {count > 0 && (
              <span className={`
                text-xs md:text-sm font-semibold
                ${reaction.iconColor}
              `}>
                {count}
              </span>
            )}

            {/* Selected indicator - animated pulse effect */}
            {isSelected && (
              <motion.div
                className={`
                  absolute inset-0 rounded-lg md:rounded-xl
                  ${reaction.bgClass}
                  opacity-50
                `}
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.3, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

export default ReactionButtons;

