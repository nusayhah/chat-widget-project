import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  PaperAirplaneIcon, 
  UserCircleIcon,
  EllipsisVerticalIcon,
  ArrowLeftCircleIcon
} from '@heroicons/react/24/outline';
import websocketService from '../services/websocketService';

const ChatSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: 'Customer',
    email: '',
    business: 'Business',
    waitingTime: '0 minutes'
  });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (sessionId) {
      fetchChatHistory(sessionId);
      setupWebSocketListeners();
    }

    return () => {
      websocketService.off('new_message');
      websocketService.off('typing');
      websocketService.off('agent_returned_to_ai');
    };
  }, [sessionId]);

  const fetchChatHistory = async (sessionId) => {
    console.log('🔄 fetchChatHistory called for session:', sessionId);
    try {
      const url = `${process.env.REACT_APP_API_URL}/widgets/sessions/${sessionId}/messages`;
      console.log('🌐 Fetching from:', url);
    
      const response = await fetch(url);
      console.log('📡 Response status:', response.status);
    
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Response data:', data);
      
        if (data.success) {
          console.log('✅ Messages received:', data.messages?.length);
          const messagesWithDates = (data.messages || []).map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        
          setMessages(messagesWithDates);
          setCustomerInfo(data.customerInfo || customerInfo);
        }
      }
    } catch (error) {
      console.error('❌ Failed to fetch chat history:', error);
      setMessages([]);
    }
  };

  const setupWebSocketListeners = () => {
    // ✅ FIX 2: Real-time message updates
    websocketService.on('new_message', (data) => {
      if (data.sessionId === sessionId && data.message.sender === 'user') {
        setMessages(prev => [...prev, {
          id: data.message.id || `msg-${Date.now()}`,
          text: data.message.text,
          sender: 'customer',
          timestamp: new Date(data.message.timestamp || Date.now()),
          isAI: data.message.isAI || false,
          waitingForAgent: data.message.waitingForAgent || false
        }]);
      }
    });

    websocketService.on('typing', (data) => {
      if (data.sessionId === sessionId) {
        setIsTyping(data.isTyping || false);
      }
    });

    // ✅ FIX 2: Handle return to AI notifications
    websocketService.on('return_to_ai_success', (data) => {
      if (data.sessionId === sessionId) {
        alert('Chat successfully returned to AI!');
        navigate('/queue');
      }
    });

    websocketService.on('return_to_ai_failed', (data) => {
      if (data.sessionId === sessionId) {
        alert(`Failed to return chat to AI: ${data.error}`);
      }
    });
  };

  // ✅ FIX 2: Return to AI functionality
  const returnToAI = async () => {
    if (window.confirm('Are you sure you want to return this chat to AI? The AI will continue assisting the customer.')) {
      try {
        websocketService.returnToAI(sessionId);
      } catch (error) {
        console.error('Failed to return chat to AI:', error);
        alert('Failed to return chat to AI. Please try again.');
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    websocketService.sendMessage(sessionId, newMessage.trim());
    
    setMessages(prev => [...prev, {
      id: `agent-${Date.now()}`,
      text: newMessage.trim(),
      sender: 'agent',
      timestamp: new Date(),
      isAI: false
    }]);
    
    setNewMessage('');
    websocketService.startTyping(sessionId);
    setTimeout(() => {
      websocketService.stopTyping(sessionId);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date)) {
      return '--:--';
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/queue')}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Queue</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                  <UserCircleIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {customerInfo.name}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{customerInfo.email || 'No email provided'}</span>
                    <span>•</span>
                    <span>{customerInfo.business}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Live Chat</span>
              </div>
              
              {/* ✅ FIX 2: Return to AI Button */}
              <button 
                onClick={returnToAI}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                title="Return this chat to AI"
              >
                <ArrowLeftCircleIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Return to AI</span>
              </button>
              
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center">
              <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <p className="text-sm text-blue-700">
                  💬 Chat started • Customer waited {customerInfo.waitingTime} in queue
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex space-x-3 max-w-xs lg:max-w-md">
                {message.sender === 'customer' && (
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                      message.isAI 
                        ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
                        : 'bg-gradient-to-br from-gray-400 to-gray-500'
                    }`}>
                      <UserCircleIcon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
                
                <div className="flex-1">
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-sm ${
                      message.sender === 'agent'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : `bg-white text-gray-900 border rounded-bl-none ${
                            message.isAI ? 'border-purple-200' : 'border-gray-200'
                          }`
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.text}
                      {message.isAI && (
                        <span className="text-xs text-purple-600 ml-2">(AI)</span>
                      )}
                      {message.waitingForAgent && (
                        <span className="text-xs text-orange-600 ml-2">(Waiting for agent)</span>
                      )}
                    </div>
                    <div className={`text-xs mt-2 ${
                      message.sender === 'agent' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>

                {message.sender === 'agent' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white text-xs font-medium">A</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-sm">
                    <UserCircleIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message... (Press Enter to send)"
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none transition-colors shadow-sm"
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {newMessage.length}/500
                </div>
              </div>
            </div>
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 shadow-sm font-medium"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSession;