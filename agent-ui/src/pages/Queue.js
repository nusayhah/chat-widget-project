import React, { useState, useEffect } from 'react';
import { CheckIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import websocketService from '../services/websocketService';

const Queue = () => {
  const [waitingSessions, setWaitingSessions] = useState([]);
  const { agent } = useAuth();
  const navigate = useNavigate();

  // 🆕 ADD this function
  const fetchWaitingSessions = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/agents/waiting-sessions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWaitingSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to fetch waiting sessions:', error);
    }
  };

  useEffect(() => {
    console.log('🎯 Queue useEffect running, agent:', agent?.id);
    
    if (agent?.id) {
      console.log('🔌 Ensuring WebSocket connection...');
      websocketService.connect(agent.id);
      
      const handleWaitingSessions = (data) => {
        console.log('📨 Received waiting sessions:', data.sessions?.length);
        setWaitingSessions(data.sessions || []);
      };

      const handleConnectionStatus = (data) => {
        console.log('🔗 Connection status:', data.status);
      };

      // 🆕 FIX: Use the new fetch function
      const handleQueueUpdate = (data) => {
        console.log('🔄 Queue update received, fetching latest sessions...');
        fetchWaitingSessions(); // Use the new API endpoint
      };

      websocketService.on('waiting_sessions', handleWaitingSessions);
      websocketService.on('connection_status', handleConnectionStatus);
      websocketService.on('queue_update', handleQueueUpdate);

      // 🆕 Use the new fetch function initially too
      fetchWaitingSessions();

      return () => {
        console.log('🧹 Cleaning up WebSocket handlers');
        websocketService.off('waiting_sessions', handleWaitingSessions);
        websocketService.off('connection_status', handleConnectionStatus);
        websocketService.off('queue_update', handleQueueUpdate);
      };
    }
  }, [agent?.id]);

  const acceptChat = async (sessionId) => {
    try {
      console.log('🟢 Accepting chat:', sessionId);
      
      websocketService.acceptChat(sessionId);
      
      setWaitingSessions(prev => prev.filter(session => session.sessionId !== sessionId));
      
      navigate(`/chat/${sessionId}`);
      
    } catch (error) {
      console.error('Failed to accept chat:', error);
      alert('❌ Failed to accept chat. Please try again.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Chat Queue</h1>
        <p className="mt-2 text-gray-600">
          Real-time incoming chat requests
          <span className={`ml-2 ${
            websocketService.getConnectionStatus() === 'connected' ? 'text-green-600' :
            websocketService.getConnectionStatus() === 'connecting' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            ● {websocketService.getConnectionStatus().charAt(0).toUpperCase() + websocketService.getConnectionStatus().slice(1)}
          </span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
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
            <div className={`p-3 rounded-lg ${
              websocketService.getConnectionStatus() === 'connected' ? 'bg-green-500' :
              websocketService.getConnectionStatus() === 'connecting' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}>
              <UserIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Connection</p>
              <p className="text-2xl font-bold text-gray-900">
                {websocketService.getConnectionStatus() === 'connected' ? 'Online' :
                 websocketService.getConnectionStatus() === 'connecting' ? 'Connecting' :
                 'Offline'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-500">
              <CheckIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Agent Status</p>
              <p className="text-2xl font-bold text-gray-900">Ready</p>
            </div>
          </div>
        </div>
      </div>

      {/* Waiting Sessions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Waiting Sessions ({waitingSessions.length})
        </h2>
        
        {waitingSessions.length > 0 ? (
          <div className="space-y-4">
            {waitingSessions.map((session) => (
              <div key={session.sessionId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{session.visitorName}</p>
                    <p className="text-sm text-gray-500">{session.businessName}</p>
                    <p className="text-xs text-gray-400">
                      Waiting: {session.waitingTime || '0'} min • {session.sessionId}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => acceptChat(session.sessionId)}
                  className="btn-primary flex items-center"
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Queue;