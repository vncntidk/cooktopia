import React, { useState, useMemo, useEffect } from 'react';
import { X, Heart, MessageCircle, Send, Bookmark, Star, Trash2, Pencil } from 'lucide-react';

// Mock recipe data - stored in modal to avoid conflicts with HomeFeed changes
const mockRecipesData = {
  1: {
    id: 1,
    title: "BINANGKAL",
    username: "april_gwpah",
    rating: 4.9,
    difficulty: "Easy",
    description: "Yummy Hotdog My Tommy. This Porksilog is very delicious! It's so delicious that I will make this Porksilog everyday. This will be my breakfast, lunch, and dinner. Oh! and maybe snacks?! HHmm",
    ingredients: [
      "1 1/2 cup all purpose flour",
      "3/4 cup powdered milk",
      "1 tablespoon baking powder",
      "1/3 cup sugar",
      "1 tablespoon melted butter (or margarine)",
      "1/4 cup evaporated milk",
      "1 piece egg",
      "1/2 cup sesame seeds",
      "Oil for deep frying"
    ],
    instructions: [
      "Mix all dry ingredients (flour, milk, baking powder, sugar) in a large bowl",
      "Add melted butter, evaporated milk, and egg to the mixture",
      "Knead until dough forms and is smooth",
      "Form small balls from the dough",
      "Roll each ball in sesame seeds until fully coated",
      "Heat oil in a deep pan over medium heat",
      "Deep fry the balls until golden brown",
      "Remove and drain excess oil on paper towels",
      "Serve warm and enjoy!"
    ],
    comments: [
      {
        username: "user_name01",
        avatar: "/profile.png",
        text: "yummyyyy <3",
        time: "1h",
        likes: 15,
        replies: 2
      }
    ]
  },
  2: {
    id: 2,
    title: "Adobo",
    username: "chef_maria",
    rating: 4.8,
    difficulty: "Medium",
    description: "Classic Filipino adobo with a perfect balance of soy sauce and vinegar. A comforting dish that brings back childhood memories!",
    ingredients: [
      "1 kg chicken, cut into pieces",
      "1/2 cup soy sauce",
      "1/3 cup vinegar",
      "6 cloves garlic, crushed",
      "2 bay leaves",
      "1 tsp whole peppercorns",
      "1 tbsp cooking oil",
      "Salt to taste"
    ],
    instructions: [
      "Marinate chicken in soy sauce, vinegar, garlic, bay leaves, and peppercorns for 30 minutes",
      "Heat oil in a large pan over medium heat",
      "Add marinated chicken and marinade to the pan",
      "Bring to a boil, then reduce heat to simmer",
      "Cover and cook for 30-40 minutes until chicken is tender",
      "Adjust seasoning with salt if needed",
      "Serve hot with steamed rice"
    ],
    comments: [
      {
        username: "foodie_lover",
        avatar: "/profile.png",
        text: "HALA OI!",
        time: "2h",
        likes: 23,
        replies: 5
      }
    ]
  }
};

export default function ViewPostModal({ isOpen, onClose, recipe: recipeInput }) {
  const [activeTab, setActiveTab] = useState('ingredients');
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
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

  // Generate recipe data based on the post ID
  const recipe = useMemo(() => {
    if (!recipeInput) return null;
    
    const postId = recipeInput.id;
    
    // Get mock data for this post ID, or use default from post 1
    const mockData = mockRecipesData[postId] || {
      ...mockRecipesData[1],
      id: postId,
      title: "Delicious Recipe",
    };
    
    return {
      ...mockData,
      image: `/posts/${postId}.jpg`,
      userAvatar: "/profile.png"
    };
  }, [recipeInput]);

  if (!isOpen || !recipe) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmitComment = () => {
    if (comment.trim()) {
      const newComment = {
        id: Date.now(),
        username: 'current_user',
        avatar: '/profile.png',
        text: comment.trim(),
        time: 'Just now',
        likes: 0,
        replies: []
      };
      setComments([newComment, ...comments]);
      setComment('');
    }
  };

  const handleSubmitReply = (commentId) => {
    if (replyText.trim()) {
      const newReply = {
        id: Date.now(),
        username: 'current_user',
        avatar: '/profile.png',
        text: replyText.trim(),
        time: 'Just now',
        likes: 0
      };
      
      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        return comment;
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

  const handleDeleteComment = (commentId) => {
    setComments(comments.filter(c => c.id !== commentId));
  };

  const handleEditComment = (commentId, currentText) => {
    setEditingComment(commentId);
    setEditText(currentText);
  };

  const toggleCommentLike = (commentId) => {
    setLikedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const toggleReplyLike = (replyId) => {
    setLikedReplies(prev => ({
      ...prev,
      [replyId]: !prev[replyId]
    }));
  };

  const handleSaveEdit = (commentId) => {
    if (editText.trim()) {
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, text: editText.trim() }
          : comment
      ));
      setEditingComment(null);
      setEditText('');
    }
  };

  const handleDeleteReply = (commentId, replyId) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: comment.replies.filter(r => r.id !== replyId)
        };
      }
      return comment;
    }));
  };

  const handleEditReply = (commentId, replyId, currentText) => {
    setEditingComment(`${commentId}-${replyId}`);
    setEditText(currentText);
  };

  const handleSaveReplyEdit = (commentId, replyId) => {
    if (editText.trim()) {
      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: comment.replies.map(reply =>
              reply.id === replyId
                ? { ...reply, text: editText.trim() }
                : reply
            )
          };
        }
        return comment;
      }));
      setEditingComment(null);
      setEditText('');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal content */}
      <div className="relative max-w-6xl w-full max-h-[90vh] bg-white rounded-[20px] shadow-2xl overflow-hidden flex">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        {/* Left side - Image */}
        <div className="w-[60%] relative">
          <img 
            src={recipe.image} 
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right side - Details */}
        <div className="w-[40%] bg-stone-50 flex flex-col">
          <div className="flex-1 overflow-y-auto" style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '24px', paddingBottom: '24px' }}>
            
            {/* User info & Follow button */}
            <div className="flex items-center gap-3 mb-6">
              <img 
                src={recipe.userAvatar} 
                alt={recipe.username}
                className="w-12 h-12 rounded-full object-cover shadow-md"
              />
              <span className="font-semibold text-base">{recipe.username}</span>
              <button 
                onClick={() => setIsFollowing(!isFollowing)}
                className={`border rounded-full text-sm transition ${
                  isFollowing 
                    ? 'border-gray-400 bg-gray-100 text-gray-700' 
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
                style={{ paddingLeft: '7px', paddingRight: '7px', paddingTop: '2px', paddingBottom: '2px' }}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>

            {/* Title and Star Rating */}
            <div className="mb-3">
              <h2 className="text-3xl font-bold mb-2">{recipe.title}</h2>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setUserRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-colors"
                  >
                    <Star 
                      className={`w-6 h-6 ${
                        star <= (hoverRating || userRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty badge and Average Rating */}
            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-sm ${
                  recipe.difficulty === 'Easy' ? 'bg-green-500' : 
                  recipe.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-base">{recipe.difficulty}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                <span className="text-sm font-medium">{recipe.rating}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-base text-gray-700 mb-6 leading-relaxed">
              {recipe.description}
            </p>

            {/* Tabs */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`rounded-full text-base font-medium transition ${
                  activeTab === 'ingredients'
                    ? 'border-2 border-[#FF8C42] text-[#FF8C42]'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
                style={{ paddingLeft: '7px', paddingRight: '7px', paddingTop: '2px', paddingBottom: '2px' }}
              >
                Ingredients
              </button>
              <button
                onClick={() => setActiveTab('instructions')}
                className={`rounded-full text-base font-medium transition ${
                  activeTab === 'instructions'
                    ? 'border-2 border-[#FF8C42] text-[#FF8C42]'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
                style={{ paddingLeft: '7px', paddingRight: '7px', paddingTop: '2px', paddingBottom: '2px' }}
              >
                Instructions
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 mb-6 overflow-y-auto">
              {activeTab === 'ingredients' ? (
                <ul className="space-y-3 text-base">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-3">•</span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ol className="space-y-4 text-base">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start">
                      <span className="font-semibold mr-3 min-w-5">{index + 1}.</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between py-4 border-t border-b border-gray-200" style={{ marginTop: '10px', marginBottom: '10px' }}>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsLiked(!isLiked)}
                  className={`transition ${isLiked ? 'text-red-500' : 'text-gray-700 hover:text-red-500'}`}
                >
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button className="text-gray-700 hover:text-[#FF8C42] transition">
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button className="text-gray-700 hover:text-[#FF8C42] transition">
                  <Send className="w-6 h-6" />
                </button>
              </div>
              <button 
                onClick={() => setIsSaved(!isSaved)}
                className={`transition ${isSaved ? 'text-[#FF8C42]' : 'text-gray-700 hover:text-[#FF8C42]'}`}
              >
                <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Comments Section */}
            <div className="space-y-6">
              {/* Display mock comment from recipe if exists */}
              {recipe.comments && recipe.comments.length > 0 && recipe.comments.map((mockComment) => (
                <div key={`mock-${mockComment.username}`} style={{ paddingBottom: '20px' }}>
                  <div className="flex gap-3">
                    <img 
                      src={mockComment.avatar} 
                      alt={mockComment.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{mockComment.username}</span>
                        <span className="text-gray-700 text-sm">{mockComment.text}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{mockComment.time}</span>
                        <span>{mockComment.likes} likes</span>
                        <button className="font-semibold hover:text-gray-700">Reply</button>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-red-500 self-start">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Display user-added comments */}
              {comments.map((commentItem) => (
                <div key={commentItem.id} style={{ paddingBottom: '20px' }}>
                  <div className="flex gap-3">
                    <img 
                      src={commentItem.avatar} 
                      alt={commentItem.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      {editingComment === commentItem.id ? (
                        // Edit mode
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(commentItem.id)}
                            className="flex-1 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(commentItem.id)}
                            className="text-xs font-semibold text-[#FF8C42] hover:text-[#e67a32]"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingComment(null);
                              setEditText('');
                            }}
                            className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{commentItem.username}</span>
                            <span className="text-gray-700 text-sm">{commentItem.text}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                            <span>{commentItem.time}</span>
                            <span>{commentItem.likes} likes</span>
                            <button 
                              onClick={() => handleEditComment(commentItem.id, commentItem.text)}
                              className="text-gray-400 hover:text-gray-600"
                              title="Edit"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={() => setReplyTo(commentItem.id)}
                              className="font-semibold hover:text-gray-700"
                            >
                              Reply
                            </button>
                          </div>
                        </>
                      )}

                      {/* Show replies toggle if there are replies */}
                      {commentItem.replies && commentItem.replies.length > 0 && (
                        <button 
                          onClick={() => toggleReplies(commentItem.id)}
                          className="text-xs text-gray-500 font-semibold mb-2 hover:text-gray-700"
                        >
                          {expandedComments[commentItem.id] ? 'Hide' : 'View'} {commentItem.replies.length} {commentItem.replies.length === 1 ? 'reply' : 'replies'}
                        </button>
                      )}

                      {/* Display replies */}
                      {expandedComments[commentItem.id] && commentItem.replies && (
                        <div className="mt-3 space-y-4 pl-4 border-l-2 border-gray-200">
                          {commentItem.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3">
                              <img 
                                src={reply.avatar} 
                                alt={reply.username}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                {editingComment === `${commentItem.id}-${reply.id}` ? (
                                  // Edit mode for reply
                                  <div className="flex items-center gap-2 mb-2">
                                    <input
                                      type="text"
                                      value={editText}
                                      onChange={(e) => setEditText(e.target.value)}
                                      onKeyPress={(e) => e.key === 'Enter' && handleSaveReplyEdit(commentItem.id, reply.id)}
                                      className="flex-1 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleSaveReplyEdit(commentItem.id, reply.id)}
                                      className="text-xs font-semibold text-[#FF8C42] hover:text-[#e67a32]"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingComment(null);
                                        setEditText('');
                                      }}
                                      className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-sm">{reply.username}</span>
                                      <span className="text-gray-700 text-sm">{reply.text}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                                      <span>{reply.time}</span>
                                      <span>{reply.likes} likes</span>
                                      <button 
                                        onClick={() => handleEditReply(commentItem.id, reply.id, reply.text)}
                                        className="text-gray-400 hover:text-gray-600"
                                        title="Edit"
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                              <div className="flex items-start gap-2">
                                <button 
                                  onClick={() => toggleReplyLike(reply.id)}
                                  className={`transition ${likedReplies[reply.id] ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                                  title="Like"
                                >
                                  <Heart className={`w-4 h-4 ${likedReplies[reply.id] ? 'fill-current' : ''}`} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteReply(commentItem.id, reply.id)}
                                  className="text-gray-400 hover:text-red-600"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply input */}
                      {replyTo === commentItem.id && (
                        <div className="mt-3 flex items-center gap-2">
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSubmitReply(commentItem.id)}
                            placeholder="Write a reply..."
                            className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSubmitReply(commentItem.id)}
                            className="text-xs font-semibold text-[#FF8C42] hover:text-[#e67a32]"
                          >
                            Post
                          </button>
                          <button
                            onClick={() => {
                              setReplyTo(null);
                              setReplyText('');
                            }}
                            className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-start gap-2">
                      <button 
                        onClick={() => toggleCommentLike(commentItem.id)}
                        className={`transition ${likedComments[commentItem.id] ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                        title="Like"
                      >
                        <Heart className={`w-4 h-4 ${likedComments[commentItem.id] ? 'fill-current' : ''}`} />
                      </button>
                      <button 
                        onClick={() => handleDeleteComment(commentItem.id)}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comment input - Fixed at bottom */}
          <div className="border-t border-gray-200 bg-stone-50" style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '16px', paddingBottom: '16px' }}>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20"
              />
              <button
                onClick={handleSubmitComment}
                disabled={!comment.trim()}
                className={`text-sm font-semibold ${
                  comment.trim() 
                    ? 'text-[#FF8C42] hover:text-[#e67a32]' 
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}