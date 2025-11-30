<<<<<<< HEAD
import React, { useState } from 'react';
import { Search, Paperclip, Send } from 'lucide-react';
import HeaderSidebarLayout from '../components/HeaderSidebarLayout';
import MessengerReactions from '../components/MessengerReactions';
=======
/**
 * Real-time Messaging Component
 * Fully functional chat system with Firestore backend
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, Paperclip, Send, X, Image as ImageIcon, Loader, CheckCheck, Check, Trash2, Edit2, MoreVertical } from 'lucide-react';
import HeaderSidebarLayout from '../components/HeaderSidebarLayout';
import MessengerReactions from '../components/MessengerReactions';
import './Messages.css';
import '../styles/messages.css';

import { useAuth } from '../contexts/AuthContext';
import { uploadImage } from '../services/cloudinary';
import toast from 'react-hot-toast';
import {
  listenToUserConversations,
  sendMessage as sendMessageService,
  listenToMessages,
  getMessageableUsers,
  startConversation,
  deleteConversation,
  editMessage,
  deleteMessage as deleteMessageService,
  updateMessageReactions,
  acceptMessageRequest,
  ignoreMessageRequest,
  markMessagesAsSeen,
} from '../services/messagingService';
>>>>>>> 48facd8e857b4c5b8e8a9825c2d5aa549462df36

// Load Freeman font
if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Freeman:wght@400;700&display=swap';
  link.rel = 'stylesheet';
  if (!document.querySelector(`link[href="${link.href}"]`)) {
    document.head.appendChild(link);
  }
}

<<<<<<< HEAD
// Mock data for conversations
const mockConversations = [
  {
    id: 1,
    name: 'Sarah Johnson',
    avatar: '/profile.png',
    lastMessage: 'That sounds perfect! I\'ll try it this weekend.',
    time: '5h ago',
    online: true,
    unread: 2
  },
  {
    id: 2,
    name: 'Mike Chen',
    avatar: '/profile.png',
    lastMessage: 'Thanks for the recipe recommendation! It turned out amazing!',
    time: '1d ago',
    online: false,
    unread: 0
  },
  {
    id: 3,
    name: 'Emily Davis',
    avatar: '/profile.png',
    lastMessage: 'Can you share the ingredient list for the chocolate cake?',
    time: '2d ago',
    online: true,
    unread: 1
  },
  {
    id: 4,
    name: 'John Smith',
    avatar: '/profile.png',
    lastMessage: 'Hey! I tried your recipe and it was delicious!',
    time: '3d ago',
    online: false,
    unread: 0
  },
  {
    id: 5,
    name: 'Lisa Anderson',
    avatar: '/profile.png',
    lastMessage: 'Do you have any vegetarian options?',
    time: '1w ago',
    online: true,
    unread: 0
  }
];

// Mock chat messages for each conversation
const mockMessagesData = {
  1: [
    {
      id: 1,
      sender: 'other',
      text: 'Hey! Do you have any good pasta recipes?',
      time: '10:30 AM',
      reactions: { heart: 2, like: 1 }
    },
    {
      id: 2,
      sender: 'me',
      text: 'Yes! I have a great carbonara recipe. Would you like me to share it?',
      time: '10:32 AM',
      reactions: { appetite: 3, like: 2 }
    },
    {
      id: 3,
      sender: 'other',
      text: 'That would be awesome! Is it difficult to make?',
      time: '10:35 AM',
      reactions: { yeah: 1 }
    },
    {
      id: 4,
      sender: 'me',
      text: 'Not at all! It\'s actually quite simple. You\'ll need eggs, bacon, parmesan, and pasta.',
      time: '10:37 AM',
      reactions: { heart: 5, appetite: 4, like: 3 }
    },
    {
      id: 5,
      sender: 'other',
      text: 'That sounds perfect! I\'ll try it this weekend.',
      time: '10:40 AM',
      reactions: { yeah: 2, like: 1 }
    }
  ],
  2: [
    {
      id: 1,
      sender: 'other',
      text: 'Thanks for the recipe recommendation! It turned out amazing!',
      time: '2:15 PM'
    },
    {
      id: 2,
      sender: 'me',
      text: 'That\'s wonderful to hear! I\'m so glad you enjoyed it!',
      time: '2:18 PM'
    },
    {
      id: 3,
      sender: 'other',
      text: 'The flavors were perfect. My family loved it too!',
      time: '2:20 PM'
    },
    {
      id: 4,
      sender: 'me',
      text: 'That makes me so happy! Feel free to ask if you need more recipes.',
      time: '2:25 PM'
    }
  ],
  3: [
    {
      id: 1,
      sender: 'other',
      text: 'Can you share the ingredient list for the chocolate cake?',
      time: '11:00 AM'
    },
    {
      id: 2,
      sender: 'me',
      text: 'Of course! You\'ll need flour, cocoa powder, sugar, eggs, butter, and vanilla extract.',
      time: '11:05 AM'
    },
    {
      id: 3,
      sender: 'other',
      text: 'Perfect! What about the measurements?',
      time: '11:08 AM'
    },
    {
      id: 4,
      sender: 'me',
      text: 'I\'ll send you the full recipe with all the details!',
      time: '11:10 AM'
    }
  ],
  4: [
    {
      id: 1,
      sender: 'other',
      text: 'Hey! I tried your recipe and it was delicious!',
      time: '9:30 AM'
    },
    {
      id: 2,
      sender: 'me',
      text: 'Thank you so much! Which recipe did you try?',
      time: '9:35 AM'
    },
    {
      id: 3,
      sender: 'other',
      text: 'The pasta carbonara. It was so creamy and flavorful!',
      time: '9:40 AM'
    }
  ],
  5: [
    {
      id: 1,
      sender: 'other',
      text: 'Do you have any vegetarian options?',
      time: '3:00 PM'
    },
    {
      id: 2,
      sender: 'me',
      text: 'Yes! I have plenty of vegetarian recipes. What type of cuisine are you interested in?',
      time: '3:05 PM'
    },
    {
      id: 3,
      sender: 'other',
      text: 'Maybe something Italian or Asian?',
      time: '3:08 PM'
    }
  ]
};

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState(mockConversations[0]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');

  // Get messages for the selected chat
  const currentMessages = mockMessagesData[selectedChat.id] || [];

  const filteredConversations = mockConversations
    .filter(conv => activeTab === 'all' || (activeTab === 'unread' && conv.unread > 0))
    .filter(conv =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      console.log('Sending:', messageInput);
      setMessageInput('');
=======
export default function Messages() {
  const { user } = useAuth();

  // State management
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchUsers, setSearchUsers] = useState('');
  const [messageableUsers, setMessageableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingConversationId, setDeletingConversationId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState('');
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const [hoveredConversationId, setHoveredConversationId] = useState(null);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const editInputRef = useRef(null);

  // Get active conversation data
  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const otherUser = activeConversation?.otherUser;
  const otherUserId = activeConversation?.participants?.find((id) => id !== user?.uid);

  // Filter conversations based on tab and search
  // isRequest is an object with userId as key, so check for current user
  const regularConversations = conversations.filter((c) => {
    const isRequestForUser = c.isRequest?.[user?.uid] || false;
    return !isRequestForUser;
  });
  const messageRequests = conversations.filter((c) => {
    const isRequestForUser = c.isRequest?.[user?.uid] || false;
    return isRequestForUser && (c.requestStatus !== 'ignored' || !c.requestStatus);
  });

  const displayedConversations =
    activeTab === 'requests'
      ? messageRequests
      : activeTab === 'unread'
      ? regularConversations.filter((c) => c.unreadCount?.[user?.uid] > 0)
      : regularConversations;

  const filteredConversations = displayedConversations.filter((conv) => {
    const name = conv.otherUser?.displayName || conv.otherUser?.name || 'Unknown';
    const lastMsg = typeof conv.lastMessage === 'string' 
      ? conv.lastMessage 
      : (conv.lastMessage?.text || '');
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastMsg.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Load conversations in real-time
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = listenToUserConversations(user.uid, (conversationsList) => {
      setConversations(conversationsList);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  // Load messages for active conversation and mark as seen
  useEffect(() => {
    if (!activeConversationId || !user?.uid) {
      setMessages([]);
      return;
    }

    const unsubscribe = listenToMessages(activeConversationId, (messagesList) => {
      setMessages(messagesList);
    });

    // Mark messages as seen when conversation is opened
    markMessagesAsSeen(activeConversationId, user.uid).catch((error) => {
      console.error('Error marking messages as seen:', error);
    });

    return () => {
      unsubscribe();
    };
  }, [activeConversationId, user?.uid]);

  // Load messageable users for new chat modal
  useEffect(() => {
    if (showNewChatModal && user?.uid) {
      getMessageableUsers(user.uid).then(setMessageableUsers);
    }
  }, [showNewChatModal, user?.uid]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (!activeConversationId && regularConversations.length > 0) {
      setActiveConversationId(regularConversations[0].id);
    }
  }, [regularConversations.length, activeConversationId]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingMessageId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingMessageId]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() && selectedFiles.length === 0) {
      return;
    }

    if (!activeConversationId || !user?.uid) {
      toast.error('No active conversation');
      return;
    }

    setSendingMessage(true);
    try {
      let attachments = [];

      // Upload files if any
      if (selectedFiles.length > 0) {
        setUploadingFiles(true);
        const uploadPromises = selectedFiles.map((file) => uploadImage(file));
        const uploadResults = await Promise.all(uploadPromises);
        attachments = uploadResults.map((result) => ({
          type: 'image',
          url: result.secure_url,
          publicId: result.public_id,
        }));
        setUploadingFiles(false);
      }

      await sendMessageService(activeConversationId, user.uid, {
        text: messageInput.trim(),
        attachments,
      });

      setMessageInput('');
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setUploadingFiles(false);
    } finally {
      setSendingMessage(false);
>>>>>>> 48facd8e857b4c5b8e8a9825c2d5aa549462df36
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

<<<<<<< HEAD
  const handleReactionClick = (messageId, emojiId, newReactions) => {
    console.log(`Message ${messageId}: Updated reactions`, newReactions);
    // Future: Add backend integration here
    // In the future, you would update the mockMessagesData state here
  };

  return (
    <HeaderSidebarLayout>
      <div className="min-h-screen bg-[#f8f6f3] flex items-start justify-center p-4" style={{ paddingTop: '80px' }}>
        {/* Main Content Area */}
        <div className="w-[1200px] h-[600px] flex gap-2 rounded-xl overflow-hidden shadow-lg">
          {/* Left Panel - Conversations */}
          <div className="w-[350px] bg-white shadow-lg flex flex-col">
            {/* Left Panel Header */}
            <div className="border-b border-gray-100" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px', paddingBottom: '4px' }}>
              {/* Messages Title */}
              <h1 className="text-4xl font-bold mb-6" style={{ fontFamily: 'Freeman, sans-serif' }}>
                Messages
              </h1>
              
              {/* All/Unread Tabs */}
              <div className="flex gap-6" style={{ marginBottom: '10px' }}>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`text-sm transition-colors ${
                    activeTab === 'all'
                      ? 'font-bold text-black underline decoration-2 underline-offset-4'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
=======
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReactionUpdate = async (messageId, emojiId, newReactions) => {
    if (!activeConversationId || !messageId) {
      console.error('Missing conversation ID or message ID');
      return;
    }

    try {
      await updateMessageReactions(messageId, activeConversationId, newReactions);
      // Reactions will update automatically via the real-time listener
    } catch (error) {
      console.error('Error updating reaction:', error);
      toast.error('Failed to update reaction');
    }
  };

  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation(); // Prevent selecting the conversation
    
    if (!window.confirm('Delete this conversation? This cannot be undone.')) {
      return;
    }

    setDeletingConversationId(conversationId);
    try {
      await deleteConversation(conversationId);
      toast.success('Conversation deleted');
      
      // Clear active conversation if it was deleted
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    } finally {
      setDeletingConversationId(null);
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessageId(message.id);
    setEditMessageText(message.text || '');
  };

  const handleSaveEdit = async (messageId) => {
    if (!editMessageText.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    try {
      await editMessage(messageId, activeConversationId, editMessageText.trim());
      setEditingMessageId(null);
      setEditMessageText('');
      toast.success('Message updated');
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error('Failed to edit message');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditMessageText('');
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) {
      return;
    }

    setDeletingMessageId(messageId);
    try {
      await deleteMessageService(messageId, activeConversationId);
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    } finally {
      setDeletingMessageId(null);
    }
  };

  const handleStartNewChat = async (userId) => {
    if (!user?.uid) {
      toast.error('You must be logged in');
      return;
    }

    try {
      const conversationId = await startConversation(user.uid, userId);
      setActiveConversationId(conversationId);
      setShowNewChatModal(false);
      setSearchUsers('');
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error(error.message || 'Failed to start conversation');
    }
  };

  const handleAcceptRequest = async (conversationId) => {
    if (!user?.uid) {
      toast.error('You must be logged in');
      return;
    }

    try {
      await acceptMessageRequest(conversationId, user.uid);
      toast.success('Message request accepted');
      
      // If this was the active conversation, it will now appear in normal list
      // The real-time listener will update the UI automatically
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept message request');
    }
  };

  const handleIgnoreRequest = async (conversationId) => {
    if (!user?.uid) {
      toast.error('You must be logged in');
      return;
    }

    try {
      await ignoreMessageRequest(conversationId, user.uid);
      toast.success('Message request ignored');
      
      // The conversation will remain in requests but marked as ignored
      // The real-time listener will update the UI automatically
    } catch (error) {
      console.error('Error ignoring request:', error);
      toast.error('Failed to ignore message request');
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStatus = (message) => {
    if (message.senderId !== user?.uid) return null;

    if (message.status === 'read') {
      return <CheckCheck className="messages-message-status read" />;
    }
    if (message.status === 'delivered') {
      return <CheckCheck className="messages-message-status delivered" />;
    }
    return <Check className="messages-message-status sent" />;
  };

  const filteredMessageableUsers = messageableUsers.filter((u) =>
    (u.displayName || u.name || '').toLowerCase().includes(searchUsers.toLowerCase())
  );

  if (loading) {
    return (
      <HeaderSidebarLayout>
        <div className="messages-loading-container">
          <div className="messages-loading-content">
            <Loader className="messages-loading-spinner" />
            <p className="messages-loading-text">Loading messages...</p>
          </div>
        </div>
      </HeaderSidebarLayout>
    );
  }

  return (
    <HeaderSidebarLayout>
      <div className="messages-page">
        <div className="messages-container">
          {/* Left Panel - Conversations */}
          <div className="messages-conversations-panel">
            <div className="messages-conversations-header">
              <div className="messages-conversations-header-top">
                <h1 className="messages-title">
                  Messages
                </h1>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="messages-new-chat-button"
                >
                  New Chat
                </button>
              </div>

              <div className="messages-tabs">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`messages-tab ${activeTab === 'all' ? 'active' : ''}`}
>>>>>>> 48facd8e857b4c5b8e8a9825c2d5aa549462df36
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('unread')}
<<<<<<< HEAD
                  className={`text-sm transition-colors ${
                    activeTab === 'unread'
                      ? 'font-bold text-black underline decoration-2 underline-offset-4'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Unread
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <div className="flex items-center bg-[#f1eaea] border border-[#ccc1c1] rounded-full px-4 py-3">
                  <Search className="w-4 h-4 text-gray-500 mr-3 flex-shrink-0" />
=======
                  className={`messages-tab ${activeTab === 'unread' ? 'active' : ''}`}
                >
                  Unread
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`messages-tab ${activeTab === 'requests' ? 'active' : ''}`}
                >
                  Requests {messageRequests.length > 0 && `(${messageRequests.length})`}
                </button>
              </div>

              <div className="messages-search-container">
                <div className="messages-search-wrapper">
                  <Search className="messages-search-icon" />
>>>>>>> 48facd8e857b4c5b8e8a9825c2d5aa549462df36
                  <input
                    type="text"
                    placeholder="Search message..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
<<<<<<< HEAD
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-500 placeholder:italic"
=======
                    className="messages-search-input"
>>>>>>> 48facd8e857b4c5b8e8a9825c2d5aa549462df36
                  />
                </div>
              </div>
            </div>

<<<<<<< HEAD
            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}>
              {filteredConversations.map((conversation, index) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedChat(conversation)}
                  className={`flex items-start gap-4 py-4 cursor-pointer transition-colors border-b border-gray-50 ${
                    selectedChat.id === conversation.id
                      ? 'bg-[#3a3b3a1c]'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Avatar with online indicator */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={conversation.avatar}
                      alt={conversation.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conversation.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  {/* Message Preview */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-black truncate pr-2">
                        {conversation.name}
                      </h3>
                      {conversation.unread > 0 && (
                        <span className="flex-shrink-0 w-5 h-5 bg-[#fe982a] text-white text-xs rounded-full flex items-center justify-center font-medium">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate mb-1">
                      {conversation.lastMessage}
                    </p>
                    <p className="text-xs text-gray-500 italic">
                      {conversation.time}
                    </p>
                  </div>
                </div>
              ))}
=======
            <div className="messages-conversations-list">
              {filteredConversations.length === 0 ? (
                <div className="messages-empty-state">
                  {searchQuery ? 'No conversations found' : activeTab === 'requests' ? 'No message requests' : 'No messages yet'}
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const convOtherUser = conversation.otherUser;
                  const unreadCount = conversation.unreadCount?.[user?.uid] || 0;

                  return (
                    <div
                      key={conversation.id}
                      onClick={() => setActiveConversationId(conversation.id)}
                      onMouseEnter={() => setHoveredConversationId(conversation.id)}
                      onMouseLeave={() => setHoveredConversationId(null)}
                      className={`messages-conversation-item ${
                        activeConversationId === conversation.id ? 'active' : ''
                      }`}
                    >
                      <div className="messages-conversation-avatar">
                        <img
                          src={convOtherUser?.profileImage || '/profile.png'}
                          alt={convOtherUser?.displayName || 'User'}
                        />
                      </div>

                      <div className="messages-conversation-content">
                        <div className="messages-conversation-header">
                          <h3 className="messages-conversation-name">
                            {convOtherUser?.displayName || convOtherUser?.name || 'Unknown User'}
                          </h3>
                          <div className="messages-conversation-actions">
                            {unreadCount > 0 && (
                              <span className="messages-unread-badge">
                                {unreadCount}
                              </span>
                            )}
                            <button
                              onClick={(e) => handleDeleteConversation(conversation.id, e)}
                              disabled={deletingConversationId === conversation.id}
                              className={`message-action-button message-delete-button ${
                                hoveredConversationId === conversation.id ? 'visible' : 'hidden'
                              }`}
                              title="Delete conversation"
                            >
                              {deletingConversationId === conversation.id ? (
                                <Loader className="animate-spin" />
                              ) : (
                                <Trash2 />
                              )}
                            </button>
                          </div>
                        </div>
                        <p className="messages-conversation-preview">
                          {typeof conversation.lastMessage === 'string' 
                            ? conversation.lastMessage 
                            : (conversation.lastMessage?.text || 'No messages yet')}
                        </p>
                        <p className="messages-conversation-time">
                          {formatTimestamp(conversation.lastMessageTime || conversation.updatedAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
>>>>>>> 48facd8e857b4c5b8e8a9825c2d5aa549462df36
            </div>
          </div>

          {/* Right Panel - Chat Window */}
<<<<<<< HEAD
          <div className="flex-1 bg-white shadow-lg flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center gap-4 border-b border-gray-200" style={{ padding: '10px 20px' }}>
              <div className="relative">
                <img
                  src={selectedChat.avatar}
                  alt={selectedChat.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {selectedChat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <h2 className="text-lg font-semibold text-black">
                {selectedChat.name}
              </h2>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto" style={{ padding: '20px 20px' }}>
              {currentMessages.map((message, index) => {
                const prevMessage = index > 0 ? currentMessages[index - 1] : null;
                const isSameSenderAsPrevious = prevMessage && prevMessage.sender === message.sender;
                const marginBottom = isSameSenderAsPrevious ? '15px' : '25px';

                return (
                  <div
                    key={message.id}
                    className={`group w-full`}
                    style={{ marginBottom: marginBottom }}
                  >
                    <div className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-start gap-4 max-w-[85%] ${message.sender === 'me' ? 'flex-row-reverse' : ''}`}>
                        {message.sender === 'other' && (
                          <img
                            src={selectedChat.avatar}
                            alt={selectedChat.name}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex flex-col gap-2">
                          <div 
                            className="text-white rounded-2xl" 
                            style={{ 
                              padding: '15px 20px',
                              backgroundColor: message.sender === 'me' ? '#e67e22' : '#fe982a'
                            }}
                          >
                            <p className="text-sm leading-relaxed break-words">{message.text}</p>
                          </div>
                          
                          {/* Messenger-style Reactions */}
                          <div className={`flex items-center gap-2 ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                            <MessengerReactions
                              messageId={message.id}
                              reactions={message.reactions || {}}
                              onReactionUpdate={handleReactionClick}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200" style={{ padding: '15px 20px' }}>
              <div className="flex items-center gap-3">
                {/* Input Field */}
                <div className="flex-1 relative">
                  <textarea
                    placeholder="Write a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    rows="1"
                    className="w-full bg-[#d9d9d9] rounded-3xl pr-12 outline-none text-sm placeholder:text-gray-500 placeholder:italic resize-none overflow-hidden"
                    style={{ 
                      paddingLeft: '16px',
                      paddingTop: '11px',
                      paddingBottom: '11px',
                      minHeight: '40px',
                      maxHeight: '120px',
                      lineHeight: '1.5'
                    }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                  />
                  <button className="absolute right-3 top-3 text-gray-600 hover:text-gray-800 transition-colors">
                    <Paperclip className="w-4 h-4" />
                  </button>
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  className="bg-white border border-gray-300 p-2.5 rounded-full hover:bg-gray-50 transition-colors flex-shrink-0"
                >
                  <Send className="w-4 h-4 text-[#005236]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HeaderSidebarLayout>
  );
}
=======
          <div className="messages-chat-panel">
            {activeConversation ? (
              <>
                {/* Message Request Banner */}
                {activeConversation.isRequest?.[user?.uid] && activeConversation.requestStatus !== 'accepted' && activeConversation.requestTo === user?.uid && (
                  <div className="messages-request-banner">
                    <p className="messages-request-banner-text">
                      <strong>{otherUser?.displayName || 'User'}</strong> wants to send you a message
                    </p>
                    <div className="messages-request-banner-actions">
                      <button
                        onClick={() => handleAcceptRequest(activeConversation.id)}
                        className="messages-request-button accept"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleIgnoreRequest(activeConversation.id)}
                        className="messages-request-button ignore"
                      >
                        Ignore
                      </button>
                    </div>
                  </div>
                )}

                {/* Chat Header */}
                <div className="messages-chat-header">
                  <div className="messages-chat-header-avatar">
                    <img
                      src={otherUser?.profileImage || '/profile.png'}
                      alt={otherUser?.displayName || 'User'}
                    />
                  </div>
                  <div className="messages-chat-header-info">
                    <h2>
                      {otherUser?.displayName || otherUser?.name || 'Unknown User'}
                    </h2>
                    <p>
                      {otherUser?.bio || ''}
                    </p>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="messages-area">
                  {messages.length === 0 ? (
                    <div className="messages-empty-chat">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages
                      .filter((msg) => !msg.deletedBy?.includes(user?.uid))
                      .map((message, index) => {
                        const prevMessage = index > 0 ? messages[index - 1] : null;
                        const isSameSender = prevMessage && prevMessage.senderId === message.senderId;
                        const isOwnMessage = message.senderId === user?.uid;

                        return (
                          <div key={message.id} className={`messages-message-wrapper ${isSameSender ? 'compact' : ''}`}>
                            <div className={`messages-message-container ${isOwnMessage ? 'own' : 'other'}`}>
                              <div className={`messages-message-content ${isOwnMessage ? 'own' : ''}`}>
                                {!isOwnMessage && (
                                  <img
                                    src={otherUser?.profileImage || '/profile.png'}
                                    alt={otherUser?.displayName || 'User'}
                                    className="messages-message-avatar"
                                  />
                                )}
                                <div className="messages-message-bubble-wrapper">
                                  {editingMessageId === message.id ? (
                                    <div className="messages-edit-container">
                                      <textarea
                                        ref={editInputRef}
                                        value={editMessageText}
                                        onChange={(e) => setEditMessageText(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && e.ctrlKey) {
                                            handleSaveEdit(message.id);
                                          } else if (e.key === 'Escape') {
                                            handleCancelEdit();
                                          }
                                        }}
                                        className="messages-edit-textarea"
                                        rows="3"
                                        autoFocus
                                      />
                                      <div className="messages-edit-actions">
                                        <button
                                          onClick={handleCancelEdit}
                                          className="messages-edit-button cancel"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={() => handleSaveEdit(message.id)}
                                          disabled={!editMessageText.trim() || deletingMessageId === message.id}
                                          className="messages-edit-button save"
                                        >
                                          Save
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div
                                        className={`messages-message-bubble ${isOwnMessage ? 'own' : 'other'}`}
                                        onMouseEnter={() => setHoveredMessageId(message.id)}
                                        onMouseLeave={() => setHoveredMessageId(null)}
                                        style={{ position: 'relative' }}
                                      >
                                        {message.text && <p className="messages-message-text">{message.text}</p>}

                                        {message.attachments?.length > 0 && (
                                          <div className="messages-message-attachments">
                                            {message.attachments.map((attachment, idx) => (
                                              <img
                                                key={idx}
                                                src={attachment.url}
                                                alt="attachment"
                                                className="messages-message-attachment"
                                                onClick={() => window.open(attachment.url, '_blank')}
                                              />
                                            ))}
                                          </div>
                                        )}

                                        {isOwnMessage && hoveredMessageId === message.id && (
                                          <div className="messages-message-actions">
                                            <button
                                              onClick={() => handleEditMessage(message)}
                                              className="messages-message-action-button"
                                              title="Edit message"
                                            >
                                              <Edit2 />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteMessage(message.id)}
                                              disabled={deletingMessageId === message.id}
                                              className="messages-message-action-button"
                                              title="Delete message"
                                            >
                                              {deletingMessageId === message.id ? (
                                                <Loader />
                                              ) : (
                                                <Trash2 />
                                              )}
                                            </button>
                                          </div>
                                        )}
                                      </div>

                                      <div className={`messages-message-meta ${isOwnMessage ? 'own' : 'other'}`}>
                                        <span className="messages-message-time">
                                          {formatMessageTime(message.createdAt)}
                                          {message.edited && <span className="messages-message-edited">(edited)</span>}
                                        </span>
                                        {getMessageStatus(message)}
                                        <MessengerReactions
                                          messageId={message.id}
                                          reactions={message.reactions || {}}
                                          onReactionUpdate={handleReactionUpdate}
                                        />
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="messages-input-container">
                  {selectedFiles.length > 0 && (
                    <div className="messages-attachment-previews">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="messages-attachment-preview">
                          <img
                            src={URL.createObjectURL(file)}
                            alt="preview"
                          />
                          <button
                            onClick={() => removeFile(index)}
                            className="messages-attachment-remove"
                          >
                            <X />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="messages-input-wrapper">
                    <div className="messages-input-field-wrapper">
                      <textarea
                        placeholder="Write a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        rows="1"
                        disabled={uploadingFiles || sendingMessage}
                        className="messages-input-field"
                        onInput={(e) => {
                          e.target.style.height = 'auto';
                          e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="messages-input-attach-button"
                        disabled={uploadingFiles || sendingMessage}
                      >
                        <Paperclip />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="messages-input-file-input"
                      />
                    </div>

                    <button
                      onClick={handleSendMessage}
                      disabled={uploadingFiles || sendingMessage || (!messageInput.trim() && selectedFiles.length === 0)}
                      className="messages-send-button"
                    >
                      {uploadingFiles || sendingMessage ? (
                        <Loader className="messages-loading-spinner" />
                      ) : (
                        <Send />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="messages-chat-empty">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>

        {/* New Chat Modal */}
        {showNewChatModal && (
          <div className="messages-modal-backdrop" onClick={() => setShowNewChatModal(false)}>
            <div className="messages-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="messages-modal-header">
                <h2 className="messages-modal-title">
                  New Chat
                </h2>
                <button onClick={() => setShowNewChatModal(false)} className="messages-modal-close">
                  <X />
                </button>
              </div>

              <div className="messages-modal-search-wrapper">
                <div className="messages-modal-search">
                  <Search className="messages-modal-search-icon" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchUsers}
                    onChange={(e) => setSearchUsers(e.target.value)}
                    className="messages-modal-search-input"
                  />
                </div>
              </div>

              <div className="messages-modal-users-list">
                {filteredMessageableUsers.length === 0 ? (
                  <p className="messages-modal-empty">
                    {searchUsers ? 'No users found' : 'Follow users to start messaging them'}
                  </p>
                ) : (
                  filteredMessageableUsers.map((u) => (
                    <div
                      key={u.userId}
                      onClick={() => handleStartNewChat(u.userId)}
                      className="messages-modal-user-item"
                    >
                      <img
                        src={u.profileImage || '/profile.png'}
                        alt={u.displayName || 'User'}
                        className="messages-modal-user-avatar"
                      />
                      <div className="messages-modal-user-info">
                        <p className="messages-modal-user-name">{u.displayName || u.name || 'Unknown User'}</p>
                        {u.bio && <p className="messages-modal-user-bio">{u.bio}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </HeaderSidebarLayout>
  );
}
>>>>>>> 48facd8e857b4c5b8e8a9825c2d5aa549462df36
