import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/apiService';
import { ChatBubbleLeftIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline';

const ChatInterface = () => {
  const [activeChats, setActiveChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { agent } = useAuth();

  useEffect(() => {
    const loadActiveChats = async () => {
      if (!agent) return;
      
      try {
        setLoading(true);
        const chats = await ApiService.getActiveChats();
        setActiveChats(chats);
      } catch (error) {
        console.error('Failed to load active chats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActiveChats();
    
    // Refresh every 10 seconds
    const interval = setInterval(loadActiveChats, 10000);
    return () => clearInterval(interval);
  }, [agent]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Active Chats</h1>
          <p className="mt-2 text-gray-600">Manage your ongoing customer conversations</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Active Chats</h1>
        <p className="mt-2 text-gray-600">
          Manage your ongoing customer conversations ({activeChats.length} active)
        </p>
      </div>

      {activeChats.length > 0 ? (
        <div className="space-y-4">
          {activeChats.map((chat) => (
            <div key={chat.session_id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {chat.visitor_name || 'Customer'}
                    </h3>
                    <p className="text-sm text-gray-600">{chat.business_name}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center">
                        <ChatBubbleLeftIcon className="h-3 w-3 mr-1" />
                        {chat.messageCount} messages
                      </span>
                      <span className="flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        Started {formatTime(chat.started_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/chat/${chat.session_id}`}
                    className="btn-primary"
                  >
                    Continue Chat
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="text-gray-500 mb-4 text-6xl">💬</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No active chats</h3>
          <p className="text-gray-600 mb-4">Accept a chat from the queue to get started</p>
          <Link to="/queue" className="btn-primary">
            Go to Chat Queue
          </Link>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;