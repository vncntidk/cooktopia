import React, { useState, useEffect, useRef } from 'react';
import { getUserProfile } from '../services/users';
import './Avatar.css';

/**
 * Reusable Avatar component that displays user profile photo or placeholder
 * Shows skeleton placeholder while loading, then smoothly transitions to actual image
 * Prevents flickering by only showing image once it's fully loaded
 * Used consistently across home feed, view post, profile pages, etc.
 * 
 * @param {string} userId - User ID to fetch profile data
 * @param {string} profileImage - Optional direct profile image URL (if already available)
 * @param {string} displayName - Optional display name for placeholder (if already available)
 * @param {string} size - Size variant: 'sm', 'md', 'lg', 'xl' (default: 'md')
 * @param {string} className - Additional CSS classes
 * @param {Function} onClick - Optional click handler
 */
export default function Avatar({ 
  userId, 
  profileImage, 
  displayName, 
  size = '',
  className = '',
  onClick 
}) {
  const [avatarData, setAvatarData] = useState({
    image: profileImage || null,
    name: displayName || 'U'
  });
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imageRef = useRef(null);

  // Fetch user profile data if userId provided and we don't have image/name
  useEffect(() => {
    if (userId && (!profileImage || !displayName)) {
      const loadUserData = async () => {
        try {
          const userProfile = await getUserProfile(userId);
          setAvatarData({
            image: userProfile.profileImage || userProfile.photoURL || null,
            name: userProfile.displayName || userProfile.name || userProfile.email?.split('@')[0] || 'U'
          });
        } catch (error) {
          console.error('Error loading user profile for avatar:', error);
          // Keep default state on error
        }
      };
      loadUserData();
    } else if (profileImage || displayName) {
      // Use provided props directly
      setAvatarData({
        image: profileImage || null,
        name: displayName || 'U'
      });
    }
  }, [userId, profileImage, displayName]);

  // Reset loading state when image URL changes
  useEffect(() => {
    setIsImageLoaded(false);
    setImageError(false);
  }, [avatarData.image]);

  // Preload image to check if it exists and is loadable
  useEffect(() => {
    if (!avatarData.image) {
      setIsImageLoaded(false);
      setImageError(false);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setIsImageLoaded(true);
      setImageError(false);
    };
    img.onerror = () => {
      setIsImageLoaded(false);
      setImageError(true);
    };
    img.src = avatarData.image;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [avatarData.image]);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsImageLoaded(false);
    setImageError(true);
  };

  const sizeClasses = {
    sm: 'avatar-sm',
    md: 'avatar-md',
    lg: 'avatar-lg',
    xl: 'avatar-xl'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  // Generate initials from name (first letter of first name + first letter of last name if available)
  const getInitials = (name) => {
    if (!name || name === 'U' || name === 'User') return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };
  
  const initials = getInitials(avatarData.name);
  
  // Generate deterministic background color from user name
  const getColorFromName = (name) => {
    if (!name || name === 'U' || name === 'User') {
      return { bg: 'rgba(107, 114, 128, 0.2)', color: '#6b7280' }; // Gray for unknown
    }
    
    // Simple hash function to generate consistent color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate a color from the hash (warm color palette)
    const hue = Math.abs(hash % 360);
    const saturation = 60 + (Math.abs(hash) % 20); // 60-80%
    const lightness = 85 + (Math.abs(hash) % 10); // 85-95% (light backgrounds)
    
    return {
      bg: `hsla(${hue}, ${saturation}%, ${lightness}%, 0.2)`,
      color: `hsl(${hue}, ${saturation}%, 40%)`, // Darker text color
    };
  };
  
  const colorScheme = getColorFromName(avatarData.name);
  const hasImage = Boolean(avatarData.image) && !imageError;
  const showSkeleton = hasImage && !isImageLoaded;

  const Component = onClick ? 'button' : 'div';
  const props = onClick ? { onClick, type: 'button', className: 'avatar-button' } : {};

  return (
    <Component
      className={`avatar ${sizeClass} ${className}`}
      {...props}
      aria-label={onClick ? `${avatarData.name} profile` : undefined}
    >
      {/* Skeleton placeholder - shown while image is loading */}
      {showSkeleton && (
        <div className="avatar-skeleton" aria-hidden="true" />
      )}
      
      {/* Actual image - only shown once loaded */}
      {hasImage && (
        <img
          ref={imageRef}
          src={avatarData.image}
          alt={`${avatarData.name} avatar`}
          className={`avatar-image ${isImageLoaded ? 'avatar-image-loaded' : 'avatar-image-hidden'}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
      
      {/* Fallback placeholder - shown when no image or image failed to load */}
      <div 
        className={`avatar-placeholder ${hasImage && isImageLoaded ? 'avatar-placeholder-hidden' : ''}`}
        style={{
          background: colorScheme.bg,
          color: colorScheme.color,
        }}
        aria-hidden="true"
      >
        {initials}
      </div>
    </Component>
  );
}

