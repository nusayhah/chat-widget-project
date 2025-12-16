// src/pages/Queue.js
import React, { useState, useEffect, useCallback } from 'react'; // Add useCallback
import { CheckIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import websocketService from '../services/websocketService';

const Queue = () => {
  const [waitingSessions, setWaitingSessions] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // Track status locally
  const { agent } = useAuth();
  const navigate = useNavigate();

  // 🆕 ADD: Use useCallback to prevent infinite re-renders
  const fetchWaitingSessions = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/agents/waiting-sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Fetched waiting sessions:', data.sessions?.length);
        setWaitingSessions(data.sessions || []);
      } else {
        console.error('Failed to fetch waiting sessions:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch waiting sessions:', error);
    }
  }, []);

  // Queue.js - Update the useEffect (around line 30-110):
  useEffect(() => {
    console.log('🎯 Queue useEffect - Agent ID:', agent?.id);

    if (!agent?.id) {
      console.log('⏳ Waiting for agent authentication...');
      return;
    }

    let isMounted = true;

    // 🆕 IMPROVED: Setup WebSocket connection and listeners
    const setupWebSocketListeners = () => {
      console.log('🔌 Setting up WebSocket listeners for agent:', agent.id);
    
      // Connect WebSocket (only if not already connected)
      if (websocketService.getConnectionStatus() !== 'connected') {
        websocketService.connect(agent.id);
      }
    
      // Set up event handlers
      const handleWaitingSessions = (data) => {
        if (isMounted && data.sessions) {
          console.log('📨 Real-time waiting sessions update:', data.sessions.length);
          setWaitingSessions(data.sessions);
        }
      };

      const handleConnectionStatus = (data) => {
        if (isMounted) {
          console.log('🔗 Connection status update:', data.status);
          setConnectionStatus(data.status);
        }
      };

      const handleQueueUpdate = (data) => {
        if (isMounted) {
          console.log('🔄 Queue update received, refreshing...');
          fetchWaitingSessions();
        }
      };

      // Remove any existing listeners first
      websocketService.off('waiting_sessions');
      websocketService.off('connection_status');
      websocketService.off('queue_update');

      // Add new listeners
      websocketService.on('waiting_sessions', handleWaitingSessions);
      websocketService.on('connection_status', handleConnectionStatus);
      websocketService.on('queue_update', handleQueueUpdate);

      // Initial fetch
      fetchWaitingSessions();
    };

    setupWebSocketListeners();

    // 🆕 ADD: Set initial connection status from service
    const initialStatus = websocketService.getConnectionStatus();
    setConnectionStatus(initialStatus);
    console.log('🔗 Initial connection status:', initialStatus);

    // 🆕 ADD: Periodic refresh to keep data fresh
    const refreshInterval = setInterval(() => {
      if (isMounted && websocketService.getConnectionStatus() === 'connected') {
        fetchWaitingSessions();
      }
    }, 30000); // Every 30 seconds

    return () => {
      console.log('🧹 Cleaning up Queue component');
      isMounted = false;
    
      // Clear intervals
      clearInterval(refreshInterval);
    
      // 🆕 FIX: DON'T remove listeners here - keep them for other components
      // Only disconnect when agent logs out (handled by AuthContext)
    };
  }, [agent?.id, fetchWaitingSessions]);

  const acceptChat = async (sessionId) => {
    try {
      console.log('🟢 Accepting chat:', sessionId);
      
      // Remove from local state immediately for better UX
      setWaitingSessions(prev => prev.filter(session => session.sessionId !== sessionId));
      
      // Send WebSocket message
      websocketService.acceptChat(sessionId);
      
      // Navigate immediately
      navigate(`/chat/${sessionId}`);
      
    } catch (error) {
      console.error('Failed to accept chat:', error);
      alert('❌ Failed to accept chat. Please try again.');
      // Refresh queue on error
      fetchWaitingSessions();
    }
  };

  // 🆕 ADD: Connection status indicator
  const getConnectionDisplay = () => {
    const status = connectionStatus || websocketService.getConnectionStatus();
    switch (status) {
      case 'connected': return { text: 'Connected', color: 'text-green-600', bg: 'bg-green-500' };
      case 'connecting': return { text: 'Connecting...', color: 'text-yellow-600', bg: 'bg-yellow-500' };
      case 'disconnected': return { text: 'Disconnected', color: 'text-red-600', bg: 'bg-red-500' };
      default: return { text: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-500' };
    }
  };

  const connectionInfo = getConnectionDisplay();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Chat Queue</h1>
        <p className="mt-2 text-gray-600">
          Real-time incoming chat requests
          <span className={`ml-2 ${connectionInfo.color}`}>
            ● {connectionInfo.text}
          </span>
        </p>
      </div>

      {/* Stats Cards - SIMPLIFIED */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Waiting Chats</p>
              <p className="text-2xl font-bold text-gray-900">{waitingSessions.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${connectionInfo.bg}`}>
              <UserIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Connection</p>
              <p className="text-2xl font-bold text-gray-900">{connectionInfo.text}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Waiting Sessions */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Waiting Sessions ({waitingSessions.length})
          </h2>
          <button 
            onClick={fetchWaitingSessions}
            className="text-sm text-blue-600 hover:text-blue-800"
            title="Refresh"
          >
            🔄 Refresh
          </button>
        </div>
        
        {waitingSessions.length > 0 ? (
          <div className="space-y-3">
            {waitingSessions.map((session) => (
              <div key={session.sessionId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{session.visitorName}</p>
                    <p className="text-sm text-gray-500">{session.businessName}</p>
                    <p className="text-xs text-gray-400">
                      Waiting: {session.waitingTime || '0'} min
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => acceptChat(session.sessionId)}
                  className="btn-primary flex items-center whitespace-nowrap"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Accept Chat
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No chats in queue</h3>
            <p className="text-gray-600">Waiting for new customer requests...</p>
            <p className="text-sm text-gray-400 mt-2">
              Connection: {connectionInfo.text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Queue;