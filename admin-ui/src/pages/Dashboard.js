import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import widgetService from '../services/widgetService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_widgets: 0,
    active_widgets: 0,
    inactive_widgets: 0,
    total_chats: 0,
    total_messages: 0,
    average_response_time: '0 min',
    customer_satisfaction: 0
  });
  const [recentWidgets, setRecentWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch widget statistics
      const statsResponse = await widgetService.getWidgetStats();
      if (statsResponse.success) {
        setStats(statsResponse.data.stats);
      } else {
        throw new Error(statsResponse.message || 'Failed to load statistics');
      }

      // Fetch recent widgets
      const widgetsResponse = await widgetService.getWidgets(1, 5);
      if (widgetsResponse.success) {
        setRecentWidgets(widgetsResponse.data.widgets);
      } else {
        throw new Error(widgetsResponse.message || 'Failed to load widgets');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'Total Widgets', 
      value: stats.total_widgets, 
      color: 'bg-blue-500',
      icon: '💬',
      description: 'Chat widgets created'
    },
    { 
      title: 'Active Widgets', 
      value: stats.active_widgets, 
      color: 'bg-green-500',
      icon: '✅',
      description: 'Currently active'
    },
    { 
      title: 'Total Chats', 
      value: stats.total_chats, 
      color: 'bg-purple-500',
      icon: '💭',
      description: 'All conversations'
    },
    { 
      title: 'Satisfaction', 
      value: `${stats.customer_satisfaction}/5`, 
      color: 'bg-orange-500',
      icon: '⭐',
      description: 'Customer rating'
    }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to your Chat Widget Generator dashboard
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>Error loading dashboard data: {error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <span className="text-white text-xl">{stat.icon}</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Widgets */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Widgets</h2>
            <Link
              to="/widgets"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>
          
          {recentWidgets.length > 0 ? (
            <div className="space-y-3">
              {recentWidgets.map((widget) => (
                <div key={widget.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: widget.primary_color }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{widget.business_name}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(widget.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    widget.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {widget.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-gray-500 mb-4">No widgets created yet</p>
              <Link to="/widgets/new" className="btn-primary">
                Create Your First Widget
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/widgets/new"
              className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
            >
              <span className="text-blue-600 mr-3 text-xl group-hover:scale-110 transition-transform">➕</span>
              <div>
                <p className="font-medium text-blue-900">Create New Widget</p>
                <p className="text-sm text-blue-600">Set up a new chat widget for your website</p>
              </div>
            </Link>
            
            <Link
              to="/analytics"
              className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
            >
              <span className="text-green-600 mr-3 text-xl group-hover:scale-110 transition-transform">📈</span>
              <div>
                <p className="font-medium text-green-900">View Analytics</p>
                <p className="text-sm text-green-600">Check your chat performance and metrics</p>
              </div>
            </Link>

            <Link
              to="/widgets"
              className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
            >
              <span className="text-purple-600 mr-3 text-xl group-hover:scale-110 transition-transform">⚙️</span>
              <div>
                <p className="font-medium text-purple-900">Manage Widgets</p>
                <p className="text-sm text-purple-600">View and edit all your chat widgets</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="mt-8 card bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-2xl">💡</span>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pro Tip</h3>
            <p className="text-gray-600">
              Place your chat widget on high-traffic pages like your homepage, contact page, and pricing page to maximize engagement with visitors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;