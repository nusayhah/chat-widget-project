import React, { useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import websocketService from '../services/websocketService';

const Layout = () => {
  const location = useLocation();
  const { agent, logout } = useAuth();

  // Connect WebSocket when agent is available
  useEffect(() => {
    if (agent?.id) {
      console.log('🔗 Connecting WebSocket for agent:', agent.id);
      websocketService.connect(agent.id);
    }

    return () => {
      // Cleanup on unmount
      websocketService.disconnect();
    };
  }, [agent]);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '🏠' },
    { name: 'Chat Queue', href: '/queue', icon: '📋' },
    { name: 'Active Chats', href: '/chats', icon: '💬' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Agent Dashboard</h1>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Agent section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {agent?.full_name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{agent?.full_name || 'Agent'}</p>
                <p className="text-xs text-green-600">
                  ● {websocketService.isConnected() ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-gray-600 text-sm"
              title="Logout"
            >
              🚪
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;