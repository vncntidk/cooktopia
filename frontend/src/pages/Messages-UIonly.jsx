import React, { useState } from 'react';
import { Search, Paperclip, Send } from 'lucide-react';
import HeaderSidebarLayout from '../components/HeaderSidebarLayout';

// Load Freeman font
if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Freeman:wght@400;700&display=swap';
  link.rel = 'stylesheet';
  if (!document.querySelector(`link[href="${link.href}"]`)) {
    document.head.appendChild(link);
  }
}

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
      time: '10:30 AM'
    },
    {
      id: 2,
      sender: 'me',
      text: 'Yes! I have a great carbonara recipe. Would you like me to share it?',
      time: '10:32 AM'
    },
    {
      id: 3,
      sender: 'other',
      text: 'That would be awesome! Is it difficult to make?',
      time: '10:35 AM'
    },
    {
      id: 4,
      sender: 'me',
      text: 'Not at all! It\'s actually quite simple. You\'ll need eggs, bacon, parmesan, and pasta.',
      time: '10:37 AM'
    },
    {
      id: 5,
      sender: 'other',
      text: 'That sounds perfect! I\'ll try it this weekend.',
      time: '10:40 AM'
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
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('unread')}
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
                  <input
                    type="text"
                    placeholder="Search message..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-500 placeholder:italic"
                  />
                </div>
              </div>
            </div>

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
            </div>
          </div>

          {/* Right Panel - Chat Window */}
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
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    style={{ marginBottom: marginBottom }}
                  >
                    <div className={`flex items-end gap-4 max-w-[85%] ${message.sender === 'me' ? 'flex-row-reverse' : ''}`}>
                      {message.sender === 'other' && (
                        <img
                          src={selectedChat.avatar}
                          alt={selectedChat.name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      <div 
                        className="text-white rounded-2xl" 
                        style={{ 
                          padding: '15px 20px',
                          backgroundColor: message.sender === 'me' ? '#e67e22' : '#fe982a'
                        }}
                      >
                        <p className="text-sm leading-relaxed break-words">{message.text}</p>
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