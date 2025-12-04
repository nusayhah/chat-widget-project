// src/components/Layout.js
import React, { useEffect, useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import websocketService from '../services/websocketService';

const Layout = () => {
  const location = useLocation();
  const { agent, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // 🆕 UPDATED: Connect WebSocket when agent is available
  useEffect(() => {
    if (agent?.id) {
      console.log('🔗 Layout: Agent detected, scheduling WebSocket connection');
      
      // 🆕 ADD DELAY TO PREVENT RAPID RECONNECTS
      const connectTimeout = setTimeout(() => {
        console.log('🔗 Layout: Connecting WebSocket for agent:', agent.id);
        websocketService.connect(agent.id);
      }, 500);
      
      // 🆕 LISTEN FOR CONNECTION STATUS UPDATES
      const handleConnectionStatus = (data) => {
        console.log('🔗 Layout: Connection status update:', data.status);
        setConnectionStatus(data.status);
      };
      
      websocketService.on('connection_status', handleConnectionStatus);
      
      return () => {
        console.log('🧹 Layout: Cleaning up WebSocket listeners');
        clearTimeout(connectTimeout);
        websocketService.off('connection_status', handleConnectionStatus);
        // 🆕 DON'T disconnect here - let Queue component handle it
        // websocketService.disconnect(); // REMOVED
      };
    }
    
    // If no agent, ensure we're disconnected
    return () => {
      console.log('🧹 Layout: No agent, ensuring clean state');
      setConnectionStatus('disconnected');
    };
  }, [agent]);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '🏠' },
    { name: 'Chat Queue', href: '/queue', icon: '📋' },
    { name: 'Active Chats', href: '/chats', icon: '💬' },
  ];

  const isActive = (path) => location.pathname === path;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // 🆕 HELPER: Get connection display info
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
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar - ALWAYS visible on desktop, HIDDEN on mobile */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-bold text-gray-900">Agent Dashboard</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                          isActive(item.href)
                            ? 'bg-gray-50 text-blue-600'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-600 text-white text-sm font-medium">
                    {agent?.full_name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <span className="sr-only">Your profile</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{agent?.full_name || 'Agent'}</p>
                    <p className={`text-xs ${connectionInfo.color}`}>
                      ● {connectionInfo.text}
                    </p>
                  </div>
                  <button
                    onClick={logout}
                    className="text-gray-400 hover:text-gray-600 ml-auto"
                    title="Logout"
                  >
                    🚪
                  </button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile header - ONLY on mobile */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <button
          type="button"
          onClick={toggleSidebar}
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        >
          <span className="text-xl">☰</span>
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-gray-900 text-center">
          Agent Dashboard
        </div>
      </div>

      {/* Mobile sidebar - slides in/out */}
      <div className={`lg:hidden ${isSidebarOpen ? 'fixed inset-0 z-50' : 'hidden'}`}>
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-900/80"
          onClick={() => setIsSidebarOpen(false)}
        />
        
        {/* Sidebar container */}
        <div className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col">
          {/* Sidebar component */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <h1 className="text-xl font-bold text-gray-900">Agent Dashboard</h1>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          onClick={() => setIsSidebarOpen(false)}
                          className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                            isActive(item.href)
                              ? 'bg-gray-50 text-blue-600'
                              : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-lg">{item.icon}</span>
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
                <li className="mt-auto">
                  <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-600 text-white text-sm font-medium">
                      {agent?.full_name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <span className="sr-only">Your profile</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{agent?.full_name || 'Agent'}</p>
                      <p className={`text-xs ${connectionInfo.color}`}>
                        ● {connectionInfo.text}
                      </p>
                    </div>
                    <button
                      onClick={logout}
                      className="text-gray-400 hover:text-gray-600 ml-auto"
                      title="Logout"
                    >
                      🚪
                    </button>
                  </div>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;