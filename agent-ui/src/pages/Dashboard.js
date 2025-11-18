import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState({
    chatsHandled: 0,
    avgResponseTime: '0 min',
    customerSatisfaction: 0
  });
  const [loading, setLoading] = useState(true);
  const { agent } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/agents/stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (agent) {
      fetchStats();
    }
  }, [agent]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {agent?.full_name}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/queue"
              className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <span className="text-blue-600 mr-3 text-xl">📋</span>
              <div>
                <p className="font-medium text-blue-900">View Chat Queue</p>
                <p className="text-sm text-blue-600">Accept waiting customer chats</p>
              </div>
            </Link>
            
            <Link
              to="/chats"
              className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-gray-600 mr-3 text-xl">💬</span>
              <div>
                <p className="font-medium text-gray-900">Active Chats</p>
                <p className="text-sm text-gray-600">Manage ongoing conversations</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Stats</h2>
          {loading ? (
            <div className="space-y-4">
              <div className="animate-pulse bg-gray-200 h-12 rounded-lg"></div>
              <div className="animate-pulse bg-gray-200 h-12 rounded-lg"></div>
              <div className="animate-pulse bg-gray-200 h-12 rounded-lg"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Chats Handled</span>
                <span className="font-bold text-gray-900">{stats.chatsHandled}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Avg Response Time</span>
                <span className="font-bold text-gray-900">{stats.avgResponseTime}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Customer Satisfaction</span>
                <span className="font-bold text-gray-900">{stats.customerSatisfaction}/5</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;