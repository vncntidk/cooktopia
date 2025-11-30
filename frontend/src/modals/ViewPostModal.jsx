import React, { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Bookmark, Star, Trash2, Pencil, Edit2, MoreVertical, Clock, ChefHat, Users } from 'lucide-react';


import { useAuth } from '../contexts/AuthContext';
import { getRecipeById, updateRecipe, deleteRecipe } from '../services/recipes';
import { getRecipeInteractionCounts, toggleRecipeLike, hasUserLikedRecipe, toggleRecipeSave, hasUserSavedRecipe, getRecipeComments, addRecipeComment, deleteRecipeComment } from '../services/interactions';
import { followUser, unfollowUser, isFollowing as checkIsFollowing } from '../services/followService';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';
import '../pages/ViewProfile.css';

export default function ViewPostModal({ isOpen, onClose, recipe: recipeInput }) {
  // Your actual hooks and state management from old code
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State variables from old code
  const [activeTab, setActiveTab] = useState('ingredients');
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [likedComments, setLikedComments] = useState({});
  const [likedReplies, setLikedReplies] = useState({});
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [interactionCounts, setInteractionCounts] = useState({ likes: 0, comments: 0, saves: 0 });
  const [showRecipeMenu, setShowRecipeMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Load real recipe data from Firebase (from old code)
  useEffect(() => {
    if (!isOpen || !recipeInput?.id) {
      return;
    }

    const loadRecipeData = async () => {
      try {
        setLoading(true);
        
        // Fetch recipe from Firebase
        const recipeData = await getRecipeById(recipeInput.id);
        
        if (!recipeData) {
          console.error('Recipe not found');
          setLoading(false);
          return;
        }
        
        // Set recipe state with real Firebase data
        setRecipe({
          id: recipeData.id,
          title: recipeData.title || 'Untitled Recipe',
          description: recipeData.description || '',
          difficulty: recipeData.difficulty || 'Easy',
          duration: recipeData.duration || 0,
          servings: recipeData.servings || 4,
          ingredients: Array.isArray(recipeData.ingredients) ? recipeData.ingredients : [],
          steps: Array.isArray(recipeData.steps) ? recipeData.steps : [],
          instructions: Array.isArray(recipeData.steps) ? recipeData.steps : [],
          imageUrls: Array.isArray(recipeData.imageUrls) ? recipeData.imageUrls : [],
          authorId: recipeData.authorId,
          authorName: recipeData.authorName || 'Unknown',
          youtubeLink: recipeData.youtubeLink || null,
          image: recipeData.imageUrls?.[0] || '/posts/placeholder.jpg',
          userAvatar: null, // Will be loaded via Avatar component
        });

        // Load real interaction counts from Firebase
        const counts = await getRecipeInteractionCounts(recipeData.id);
        setInteractionCounts(counts);

        // Check user interactions (like, save, follow) - only if user is authenticated
        if (user?.uid) {
          try {
            const checkFollowing = recipeData.authorId && recipeData.authorId !== user.uid
              ? checkIsFollowing(user.uid, recipeData.authorId)
              : Promise.resolve(false);

            const [liked, saved, following] = await Promise.all([
              hasUserLikedRecipe(recipeData.id, user.uid),
              hasUserSavedRecipe(recipeData.id, user.uid),
              checkFollowing,
            ]);
            setIsLiked(liked);
            setIsSaved(saved);
            setIsFollowing(following);
          } catch (error) {
            console.error('Error checking user interactions:', error);
            // Set defaults on error
            setIsLiked(false);
            setIsSaved(false);
            setIsFollowing(false);
          }
        }

        // Load comments from Firebase
        const recipeComments = await getRecipeComments(recipeData.id);
        setComments(recipeComments);
      } catch (error) {
        console.error('Error loading recipe:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecipeData();
  }, [isOpen, recipeInput, user]);

  // Close menu on escape key
  useEffect(() => {
    if (!showRecipeMenu) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowRecipeMenu(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showRecipeMenu]);

  // Prevent body scroll when modal is open (NEW from improved design)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key (NEW from improved design)
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Early return after all hooks
  if (!isOpen || !recipe) return null;

  // Event handlers from old code
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
    setShowRecipeMenu(false);
  };

  const handleSubmitComment = async () => {
    if (!comment.trim() || !user?.uid || !recipe?.id) {
      return;
    }

    try {
      // Add comment to Firebase
      await addRecipeComment(
        recipe.id,
        user.uid,
        user.displayName || user.email?.split('@')[0] || 'User',
        user.photoURL || null,
        comment.trim()
      );
      
      // Reload comments from Firebase to get updated list
      const recipeComments = await getRecipeComments(recipe.id);
      setComments(recipeComments);
      
      // Update interaction counts
      const counts = await getRecipeInteractionCounts(recipe.id);
      setInteractionCounts(counts);
      
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleToggleLike = async () => {
    if (!user?.uid || !recipe?.id) return;

    try {
      // Toggle like in Firebase
      const newLikedState = await toggleRecipeLike(recipe.id, user.uid);
      setIsLiked(newLikedState);
      
      // Refresh interaction counts from Firebase
      const counts = await getRecipeInteractionCounts(recipe.id);
      setInteractionCounts(counts);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleToggleSave = async () => {
    if (!user?.uid || !recipe?.id) return;

    try {
      // Toggle save in Firebase
      const newSavedState = await toggleRecipeSave(recipe.id, user.uid);
      setIsSaved(newSavedState);
      
      // Refresh interaction counts from Firebase
      const counts = await getRecipeInteractionCounts(recipe.id);
      setInteractionCounts(counts);
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const handleProfileClick = (authorId) => {
    if (authorId && user?.uid) {
      navigate(`/profile/${authorId}`);
    }
  };

  const handleFollowToggle = async () => {
    if (!user?.uid || !recipe?.authorId || user.uid === recipe.authorId || followLoading) {
      return;
    }

    setFollowLoading(true);
    try {
      // Toggle follow/unfollow in Firebase
      if (isFollowing) {
        await unfollowUser(user.uid, recipe.authorId);
        setIsFollowing(false);
      } else {
        await followUser(user.uid, recipe.authorId);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!recipe?.id || !user?.uid) return;
    
    // Check if user owns this comment
    const commentItem = comments.find(c => c.id === commentId);
    if (!commentItem || commentItem.userId !== user.uid) {
      console.warn('User does not own this comment');
      return;
    }

    try {
      // Delete comment from Firebase
      await deleteRecipeComment(recipe.id, commentId);
      
      // Remove from UI
      setComments(comments.filter(c => c.id !== commentId));
      
      // Refresh interaction counts from Firebase
      const counts = await getRecipeInteractionCounts(recipe.id);
      setInteractionCounts(counts);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleEditComment = (commentId, currentText) => {
    setEditingComment(commentId);
    setEditText(currentText);
  };

  const handleSaveEdit = (commentId) => {
    if (editText.trim()) {
      setComments(comments.map(c => 
        c.id === commentId ? { ...c, text: editText.trim() } : c
      ));
      setEditingComment(null);
      setEditText('');
    }
  };

  const toggleCommentLike = (commentId) => {
    setLikedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const handleSubmitReply = (commentId) => {
    if (replyText.trim()) {
      const newReply = {
        id: Date.now(),
        username: user.displayName || 'current_user',
        avatar: user.photoURL || null,
        text: replyText.trim(),
        time: 'Just now',
        likes: 0
      };
      
      setComments(comments.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: [...(c.replies || []), newReply]
          };
        }
        return c;
      }));
      
      setReplyText('');
      setReplyTo(null);
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const handleDeleteReply = (commentId, replyId) => {
    setComments(comments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: c.replies.filter(r => r.id !== replyId)
        };
      }
      return c;
    }));
  };

  const handleEditReply = (commentId, replyId, currentText) => {
    setEditingComment(`${commentId}-${replyId}`);
    setEditText(currentText);
  };

  const handleSaveReplyEdit = (commentId, replyId) => {
    if (editText.trim()) {
      setComments(comments.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: c.replies.map(r =>
              r.id === replyId ? { ...r, text: editText.trim() } : r
            )
          };
        }
        return c;
      }));
      setEditingComment(null);
      setEditText('');
    }
  };

  const toggleReplyLike = (replyId) => {
    setLikedReplies(prev => ({
      ...prev,
      [replyId]: !prev[replyId]
    }));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'difficulty-easy';
      case 'Medium': return 'difficulty-medium';
      case 'Hard': return 'difficulty-hard';
      default: return 'difficulty-default';
    }
  };

  // Check if current user is the recipe owner
  const isOwner = user?.uid && recipe?.authorId === user.uid;

  // Handle edit navigation
  const handleEditRecipe = () => {
    if (!recipe?.id || !isOwner) return;
    setShowRecipeMenu(false);
    onClose(); // Close the modal first
    navigate(`/edit-recipe/${recipe.id}`);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!user?.uid || !recipe?.id || !isOwner || isDeleting) return;
    
    setIsDeleting(true);
    try {
      await deleteRecipe(recipe.id);
      toast.success('Recipe deleted successfully');
      setShowDeleteDialog(false);
      onClose();
      // Refresh the page to update recipe lists
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast.error(error.message || 'Failed to delete recipe. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <style>{`
        /* Modal Animations */
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes backdropFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Modal Backdrop */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background-color: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          animation: backdropFadeIn 0.2s ease-out;
        }

        /* Modal Container */
        .modal-content {
          position: relative;
          width: 100%;
          max-width: 72rem;
          max-height: 90vh;
          background-color: white;
          border-radius: 1rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          display: flex;
          animation: modalFadeIn 0.3s ease-out;
        }

        /* Close Button */
        .close-button {
          position: absolute;
          top: 1rem;
          left: 1rem;
          z-index: 20;
          padding: 0.625rem;
          background-color: rgba(255, 255, 255, 0.95);
          border: none;
          border-radius: 9999px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background-color: white;
          transform: scale(1.1);
        }

        /* Image Section */
        .image-section {
          width: 55%;
          position: relative;
          background-color: #f3f4f6;
        }

        .image-container {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
        }

        .image-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.1) 100%);
          z-index: 1;
        }

        .recipe-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Quick Stats Overlay */
        .stats-overlay {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          display: flex;
          gap: 0.5rem;
          z-index: 10;
        }

        .stat-badge {
          padding: 0.375rem 0.75rem;
          backdrop-filter: blur(8px);
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: 9999px;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .stat-badge-text {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        /* Content Section */
        .content-section {
          width: 45%;
          background-color: #fafaf9;
          display: flex;
          flex-direction: column;
        }

        /* Header */
        .modal-header {
          padding: 1.5rem 1.5rem 1rem;
          background-color: white;
          border-bottom: 1px solid #f3f4f6;
          position: relative;
        }

        .author-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          gap: 1rem;
          width: 100%;
        }

        .author-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: opacity 0.2s ease;
          flex-shrink: 0;
          min-width: 0;
        }

        .author-info:hover {
          opacity: 0.8;
        }

        .author-details {
          text-align: left;
        }

        .author-name {
          font-weight: 600;
          font-size: 1rem;
          color: #111827;
        }

        .author-label {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .action-buttons {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
          margin-left: auto;
        }


        .menu-button {
          padding: 0.5rem;
          background: none;
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .menu-button:hover {
          background-color: #f3f4f6;
        }

        .menu-dropdown {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 0.5rem;
          background-color: white;
          border-radius: 0.75rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          border: 1px solid #f3f4f6;
          padding: 0.25rem 0;
          z-index: 30;
          min-width: 140px;
        }

        .menu-item {
          width: 100%;
          padding: 0.625rem 1rem;
          text-align: left;
          font-size: 0.875rem;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background-color 0.2s ease;
        }

        .menu-item.edit {
          color: #374151;
        }

        .menu-item.edit:hover {
          background-color: #f9fafb;
        }

        .menu-item.delete {
          color: #dc2626;
        }

        .menu-item.delete:hover {
          background-color: #fef2f2;
        }

        .menu-item:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Recipe Title */
        .recipe-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.75rem;
          line-height: 1.2;
        }

        /* Rating Section */
        .rating-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .star-rating {
          display: flex;
          align-items: center;
          gap: 0.125rem;
        }

        .star-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: transform 0.2s ease;
        }

        .star-button:hover {
          transform: scale(1.1);
        }

        .star-icon {
          width: 1.25rem;
          height: 1.25rem;
          transition: color 0.2s ease;
        }

        .star-icon.filled {
          fill: #fbbf24;
          color: #fbbf24;
        }

        .star-icon.empty {
          color: #d1d5db;
        }

        .average-rating {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
        }

        .rating-value {
          font-weight: 600;
          color: #374151;
        }

        .rating-count {
          color: #6b7280;
        }

        /* Difficulty Badge */
        .difficulty-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.75rem;
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 9999px;
        }

        .difficulty-dot {
          width: 0.625rem;
          height: 0.625rem;
          border-radius: 9999px;
        }

        .difficulty-easy { background-color: #10b981; }
        .difficulty-medium { background-color: #f59e0b; }
        .difficulty-hard { background-color: #ef4444; }
        .difficulty-default { background-color: #6b7280; }

        .difficulty-text {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        /* Description Section */
        .description-section {
          padding: 1rem 1.5rem;
          background-color: white;
          border-bottom: 1px solid #f3f4f6;
        }

        .description-text {
          font-size: 0.875rem;
          color: #4b5563;
          line-height: 1.6;
        }

        /* Tabs Navigation */
        .tabs-nav {
          padding: 0.75rem 1.5rem;
          background-color: white;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          gap: 1.5rem;
        }

        .tab-button {
          position: relative;
          padding-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .tab-button.inactive {
          color: #6b7280;
        }

        .tab-button.inactive:hover {
          color: #374151;
        }

        .tab-button.active {
          color: #ea580c;
        }

        .tab-button.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #f97316, #ea580c);
          border-radius: 2px 2px 0 0;
        }

        /* Scrollable Content */
        .content-area {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem 1.5rem;
          position: relative;
        }

        .content-area::-webkit-scrollbar {
          width: 6px;
        }

        .content-area::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 3px;
        }

        .content-area::-webkit-scrollbar-thumb {
          background: rgba(255, 140, 66, 0.3);
          border-radius: 3px;
        }

        .content-area::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 140, 66, 0.5);
        }

        .scroll-gradient::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 40px;
          background: linear-gradient(to bottom, rgba(250, 250, 249, 0), rgba(250, 250, 249, 1));
          pointer-events: none;
        }

        /* Ingredients List */
        .ingredients-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .ingredient-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem;
          margin-bottom: 0.625rem;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
        }

        .ingredient-item:hover {
          background-color: rgba(255, 140, 66, 0.05);
          transform: translateX(4px);
        }

        .ingredient-bullet {
          width: 0.375rem;
          height: 0.375rem;
          border-radius: 9999px;
          background-color: #f97316;
          margin-top: 0.5rem;
          flex-shrink: 0;
        }

        .ingredient-text {
          font-size: 0.875rem;
          color: #374151;
          line-height: 1.6;
        }

        /* Instructions List */
        .instructions-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .instruction-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          margin-bottom: 1rem;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
        }

        .instruction-item:hover {
          background-color: rgba(255, 140, 66, 0.05);
          transform: translateX(4px);
        }

        .instruction-number {
          flex-shrink: 0;
          width: 1.75rem;
          height: 1.75rem;
          border-radius: 9999px;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 700;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .instruction-text {
          font-size: 0.875rem;
          color: #374151;
          line-height: 1.6;
          padding-top: 0.125rem;
        }

        /* Comments Section */
        .comments-container {
          padding: 0;
        }

        .comments-empty {
          text-align: center;
          padding: 2rem 0;
        }

        .comments-empty-icon {
          width: 3rem;
          height: 3rem;
          color: #d1d5db;
          margin: 0 auto 0.75rem;
        }

        .comments-empty-text {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .comment-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border-radius: 0.5rem;
          transition: background-color 0.2s ease;
        }

        .comment-item:hover {
          background-color: white;
        }

        .comment-content {
          flex: 1;
        }

        .comment-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .comment-author {
          font-weight: 600;
          font-size: 0.875rem;
          color: #111827;
        }

        .comment-time {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .comment-text {
          font-size: 0.875rem;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .comment-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .comment-action-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          color: #6b7280;
          transition: color 0.2s ease;
        }

        .comment-action-button:hover {
          color: #374151;
        }

        .comment-action-button.like-button {
          color: #9ca3af;
          transition: all 0.2s ease;
        }

        .comment-action-button.like-button:hover {
          color: #ef4444;
        }

        .comment-action-button.like-button.liked {
          color: #ef4444;
        }

        .comment-action-button.delete-button:hover {
          color: #dc2626;
        }

        .comment-edit-input {
          flex: 1;
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          outline: none;
        }

        .comment-edit-input:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }

        .comment-edit-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .comment-edit-save {
          font-size: 0.75rem;
          font-weight: 600;
          color: #f97316;
          background: none;
          border: none;
          cursor: pointer;
        }

        .comment-edit-save:hover {
          color: #ea580c;
        }

        .comment-edit-cancel {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          background: none;
          border: none;
          cursor: pointer;
        }

        .comment-edit-cancel:hover {
          color: #374151;
        }

        /* Replies */
        .replies-toggle {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 600;
          margin-bottom: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }

        .replies-toggle:hover {
          color: #374151;
        }

        .replies-container {
          margin-top: 0.75rem;
          padding-left: 1rem;
          border-left: 2px solid #e5e7eb;
        }

        .reply-item {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .reply-input-container {
          margin-top: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .reply-input {
          flex: 1;
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          outline: none;
        }

        .reply-input:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.1);
        }

        /* Action Buttons Bar */
        .actions-bar {
          padding: 1rem 1.5rem;
          background-color: white;
          border-top: 1px solid #e5e7eb;
        }

        .actions-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .actions-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: 9999px;
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-button:hover {
          background-color: #f3f4f6;
          transform: translateY(-2px);
        }

        .action-button:active {
          transform: translateY(0);
        }

        .action-button.like-active {
          background-color: #fef2f2;
          color: #ef4444;
        }

        .action-button.like-inactive {
          color: #6b7280;
        }

        .action-button.like-inactive:hover {
          color: #ef4444;
        }

        .action-button.comment-button {
          color: #6b7280;
        }

        .action-button.comment-button:hover {
          color: #f97316;
        }

        .action-button.save-active {
          background-color: #fff7ed;
          color: #f97316;
        }

        .action-button.save-inactive {
          color: #6b7280;
        }

        .action-button.save-inactive:hover {
          color: #f97316;
        }

        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-count {
          font-size: 0.875rem;
          font-weight: 600;
        }

        /* Comment Input */
        .comment-input-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .comment-input {
          flex: 1;
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 9999px;
          outline: none;
          transition: all 0.2s ease;
        }

        .comment-input:focus {
          background-color: white;
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }

        .comment-submit {
          padding: 0.625rem 1.25rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .comment-submit.active {
          background: linear-gradient(to right, #f97316, #ea580c);
          color: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .comment-submit.active:hover {
          background: linear-gradient(to right, #ea580c, #c2410c);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .comment-submit.inactive {
          background-color: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }

        /* Avatar Component */
        .avatar {
          border-radius: 9999px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .avatar-sm {
          width: 2rem;
          height: 2rem;
          font-size: 0.75rem;
        }

        .avatar-md {
          width: 2.5rem;
          height: 2.5rem;
          font-size: 0.875rem;
        }

        .avatar-lg {
          width: 3rem;
          height: 3rem;
          font-size: 1rem;
        }

        .avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          font-weight: 600;
          text-transform: uppercase;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: white;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .modal-content {
            flex-direction: column;
            max-height: 95vh;
          }
          
          .image-section {
            width: 100%;
            height: 300px;
          }
          
          .content-section {
            width: 100%;
            max-height: calc(95vh - 300px);
          }

          .close-button {
            top: 0.75rem;
            left: 0.75rem;
            padding: 0.5rem;
          }

          .author-section {
            flex-wrap: wrap;
            gap: 0.75rem;
          }

          .action-buttons {
            width: 100%;
            justify-content: flex-end;
            margin-left: 0;
          }

          .modal-header {
            padding: 1rem;
          }
        }

        /* No data message */
        .no-data {
          color: #9ca3af;
          font-style: italic;
        }
      `}</style>

      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          
          {/* Close Button */}
          <button onClick={onClose} className="close-button" aria-label="Close modal">
            <X className="w-5 h-5 text-gray-700" />
          </button>

          {/* LEFT SECTION - Featured Image */}
          <div className="image-section">
            <div className="image-container">
              <img 
                src={recipe.image} 
                alt={recipe.title}
                className="recipe-image"
              />
              
              {/* Quick Stats Overlay */}
              {(recipe.duration || recipe.servings) && (
                <div className="stats-overlay">
                  {recipe.duration && (
                    <div className="stat-badge">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span className="stat-badge-text">{recipe.duration} min</span>
                    </div>
                  )}
                  {recipe.servings && (
                    <div className="stat-badge">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="stat-badge-text">{recipe.servings} servings</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SECTION - Content */}
          <div className="content-section">
            
            {/* Header - Author Info & Actions */}
            <div className="modal-header">
              <div className="author-section">
                <button 
                  onClick={() => handleProfileClick(recipe.authorId)}
                  className="author-info"
                >
                  <Avatar
                    userId={recipe.authorId}
                    profileImage={recipe.userAvatar}
                    displayName={recipe.authorName || recipe.username}
                    size="md"
                    className="ring-2 ring-gray-100"
                  />
                  <div className="author-details">
                    <p className="author-name">{recipe.authorName || recipe.username}</p>
                    <p className="author-label">Recipe Creator</p>
                  </div>
                </button>
                
                <div className="action-buttons">
                  {/* Follow button - show for non-owners */}
                  {!isOwner && user?.uid && recipe.authorId && (
                    <button 
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`follow-button ${isFollowing ? 'follow-button--following' : 'follow-button--not-following'} ${followLoading ? 'follow-button--loading' : ''}`}
                    >
                      {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                  
                  {/* Edit/Delete menu - show for owners only */}
                  {isOwner && (
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setShowRecipeMenu(!showRecipeMenu)}
                        className="menu-button"
                        aria-label="Recipe options"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                      {showRecipeMenu && (
                        <div className="menu-dropdown">
                          <button
                            onClick={handleEditRecipe}
                            className="menu-item edit"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit Recipe
                          </button>
                          <button
                            onClick={() => {
                              setShowRecipeMenu(false);
                              setShowDeleteDialog(true);
                            }}
                            disabled={isDeleting}
                            className="menu-item delete"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Recipe
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Recipe Title */}
              <h1 className="recipe-title">{recipe.title}</h1>
              
              {/* Star Rating - Interactive */}
              <div className="rating-section">
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setUserRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="star-button"
                    >
                      <Star 
                        className={`star-icon ${
                          star <= (hoverRating || userRating) ? 'filled' : 'empty'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="average-rating">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="rating-value">{recipe.rating}</span>
                  <span className="rating-count">(256 ratings)</span>
                </div>
              </div>

              {/* Difficulty Badge */}
              <div className="difficulty-badge">
                <div className={`difficulty-dot ${getDifficultyColor(recipe.difficulty)}`} />
                <span className="difficulty-text">{recipe.difficulty}</span>
                <ChefHat className="w-4 h-4 text-gray-400 ml-1" />
              </div>
            </div>

            {/* Description */}
            {recipe.description && (
              <div className="description-section">
                <p className="description-text">{recipe.description}</p>
              </div>
            )}

            {/* Tabs Navigation */}
            <div className="tabs-nav">
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`tab-button ${activeTab === 'ingredients' ? 'active' : 'inactive'}`}
              >
                Ingredients
              </button>
              <button
                onClick={() => setActiveTab('instructions')}
                className={`tab-button ${activeTab === 'instructions' ? 'active' : 'inactive'}`}
              >
                Instructions
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`tab-button ${activeTab === 'comments' ? 'active' : 'inactive'}`}
              >
                Comments ({interactionCounts.comments})
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="content-area scroll-gradient">
              {/* Ingredients Tab */}
              {activeTab === 'ingredients' && (
                <ul className="ingredients-list">
                  {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? (
                    recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="ingredient-item">
                        <div className="ingredient-bullet" />
                        <span className="ingredient-text">{ingredient}</span>
                      </li>
                    ))
                  ) : (
                    <li className="ingredient-text no-data">No ingredients listed</li>
                  )}
                </ul>
              )}

              {/* Instructions Tab */}
              {activeTab === 'instructions' && (
                <ol className="instructions-list">
                  {Array.isArray(recipe.steps || recipe.instructions) && (recipe.steps || recipe.instructions).length > 0 ? (
                    (recipe.steps || recipe.instructions).map((step, index) => (
                      <li key={index} className="instruction-item">
                        <div className="instruction-number">{index + 1}</div>
                        <span className="instruction-text">{step}</span>
                      </li>
                    ))
                  ) : (
                    <div className="instruction-text no-data">No instructions listed</div>
                  )}
                </ol>
              )}

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div className="comments-container">
                  {comments.length === 0 ? (
                    <div className="comments-empty">
                      <MessageCircle className="comments-empty-icon" />
                      <p className="comments-empty-text">No comments yet. Be the first to share your thoughts!</p>
                    </div>
                  ) : (
                    comments.map((commentItem) => (
                      <div key={commentItem.id} className="comment-item">
                        <Avatar
                          userId={commentItem.userId}
                          profileImage={commentItem.userAvatar || commentItem.avatar}
                          displayName={commentItem.userName || commentItem.username}
                          size="sm"
                        />
                        <div className="comment-content">
                          {editingComment === commentItem.id ? (
                            <div>
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(commentItem.id)}
                                className="comment-edit-input"
                                autoFocus
                              />
                              <div className="comment-edit-actions">
                                <button onClick={() => handleSaveEdit(commentItem.id)} className="comment-edit-save">
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingComment(null);
                                    setEditText('');
                                  }}
                                  className="comment-edit-cancel"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="comment-header">
                                <span className="comment-author">{commentItem.userName || commentItem.username}</span>
                                <span className="comment-time">
                                  {commentItem.createdAt?.toDate 
                                    ? new Date(commentItem.createdAt.toDate()).toLocaleString() 
                                    : (commentItem.time || 'Just now')}
                                </span>
                              </div>
                              <p className="comment-text">{commentItem.text}</p>
                              <div className="comment-actions">
                                <span>{commentItem.likes || 0} likes</span>
                                {user?.uid === commentItem.userId && (
                                  <button 
                                    onClick={() => handleEditComment(commentItem.id, commentItem.text)}
                                    className="comment-action-button"
                                  >
                                    <Pencil className="w-3 h-3" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '2px' }} />
                                    Edit
                                  </button>
                                )}
                                <button 
                                  onClick={() => setReplyTo(commentItem.id)}
                                  className="comment-action-button"
                                >
                                  Reply
                                </button>
                              </div>

                              {/* Replies */}
                              {commentItem.replies && commentItem.replies.length > 0 && (
                                <button 
                                  onClick={() => toggleReplies(commentItem.id)}
                                  className="replies-toggle"
                                >
                                  {expandedComments[commentItem.id] ? 'Hide' : 'View'} {commentItem.replies.length} {commentItem.replies.length === 1 ? 'reply' : 'replies'}
                                </button>
                              )}

                              {expandedComments[commentItem.id] && commentItem.replies && (
                                <div className="replies-container">
                                  {commentItem.replies.map((reply) => (
                                    <div key={reply.id} className="reply-item">
                                      <Avatar
                                        userId={reply.userId}
                                        profileImage={reply.avatar}
                                        displayName={reply.username}
                                        size="sm"
                                      />
                                      <div className="comment-content">
                                        <div className="comment-header">
                                          <span className="comment-author">{reply.username}</span>
                                          <span className="comment-time">{reply.time}</span>
                                        </div>
                                        <p className="comment-text">{reply.text}</p>
                                      </div>
                                      <button 
                                        onClick={() => toggleReplyLike(reply.id)}
                                        className={`comment-action-button like-button ${likedReplies[reply.id] ? 'liked' : ''}`}
                                      >
                                        <Heart className={`w-4 h-4 ${likedReplies[reply.id] ? 'fill-current' : ''}`} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {replyTo === commentItem.id && (
                                <div className="reply-input-container">
                                  <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSubmitReply(commentItem.id)}
                                    placeholder="Write a reply..."
                                    className="reply-input"
                                    autoFocus
                                  />
                                  <button onClick={() => handleSubmitReply(commentItem.id)} className="comment-edit-save">
                                    Post
                                  </button>
                                  <button
                                    onClick={() => {
                                      setReplyTo(null);
                                      setReplyText('');
                                    }}
                                    className="comment-edit-cancel"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => toggleCommentLike(commentItem.id)}
                            className={`comment-action-button like-button ${likedComments[commentItem.id] ? 'liked' : ''}`}
                          >
                            <Heart className={`w-4 h-4 ${likedComments[commentItem.id] ? 'fill-current' : ''}`} />
                          </button>
                          {user?.uid === commentItem.userId && (
                            <button 
                              onClick={() => handleDeleteComment(commentItem.id)}
                              className="comment-action-button delete-button"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons Bar */}
            <div className="actions-bar">
              <div className="actions-row">
                <div className="actions-left">
                  <button 
                    onClick={handleToggleLike}
                    disabled={!user?.uid}
                    className={`action-button ${isLiked ? 'like-active' : 'like-inactive'}`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="action-count">{interactionCounts.likes}</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('comments')}
                    className="action-button comment-button"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="action-count">{interactionCounts.comments}</span>
                  </button>
                </div>
                
                <button 
                  onClick={handleToggleSave}
                  disabled={!user?.uid}
                  className={`action-button ${isSaved ? 'save-active' : 'save-inactive'}`}
                >
                  <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                  <span className="action-count">{interactionCounts.saves}</span>
                </button>
              </div>

              {/* Comment Input */}
              <div className="comment-input-container">
                <Avatar
                  userId={user?.uid}
                  profileImage={user?.photoURL}
                  displayName={user?.displayName || 'You'}
                  size="sm"
                />
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                  placeholder="Add a comment..."
                  className="comment-input"
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!comment.trim()}
                  className={`comment-submit ${comment.trim() ? 'active' : 'inactive'}`}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => !isDeleting && setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Recipe"
        message="Are you sure you want to delete this recipe? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}

