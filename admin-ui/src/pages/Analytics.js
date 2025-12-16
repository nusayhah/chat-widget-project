import React, { useState, useEffect } from 'react';
import { ChartBarIcon, UsersIcon, ChatBubbleLeftRightIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import widgetService from '../services/widgetService';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      total_chats: 0,
      total_messages: 0,
      average_response_time: '0 min',
      customer_satisfaction: 0
    },
    recentActivity: [],
    topWidgets: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch widget statistics (this includes analytics data)
      const statsResponse = await widgetService.getWidgetStats();
      if (statsResponse.success) {
        const stats = statsResponse.data.stats;
        
        // Use ONLY real data from backend - no mock data!
        setAnalyticsData({
          overview: {
            total_chats: stats.total_chats || 0,
            total_messages: stats.total_messages || 0,
            average_response_time: stats.average_response_time || '0 min',
            customer_satisfaction: stats.customer_satisfaction || 0
          },
          // These will be empty until real analytics endpoints are implemented
          recentActivity: [],
          topWidgets: []
        });
      } else {
        throw new Error(statsResponse.message || 'Failed to load analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const overviewCards = [
    {
      title: 'Total Chats',
      value: analyticsData.overview.total_chats,
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-blue-500',
      description: 'All customer conversations'
    },
    {
      title: 'Total Messages',
      value: analyticsData.overview.total_messages,
      icon: UsersIcon,
      color: 'bg-green-500',
      description: 'Messages exchanged'
    },
    {
      title: 'Avg Response Time',
      value: analyticsData.overview.average_response_time,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      description: 'Average reply time'
    },
    {
      title: 'Satisfaction',
      value: `${analyticsData.overview.customer_satisfaction}/5`,
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      description: 'Customer rating'
    }
  ];

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
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-gray-600">
          Monitor your chat widget performance and customer interactions
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>Error loading analytics: {error}</p>
          <button 
            onClick={fetchAnalyticsData}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {overviewCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {analyticsData.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {analyticsData.recentActivity.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="flex space-x-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-blue-600">{day.chats}</p>
                      <p className="text-gray-500">Chats</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-green-600">{day.messages}</p>
                      <p className="text-gray-500">Messages</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Data Coming Soon</h3>
              <p className="text-gray-600 mb-4">
                Detailed analytics and activity tracking will be available in the next update.
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>• Daily chat and message statistics</p>
                <p>• Performance trends over time</p>
                <p>• Customer engagement metrics</p>
              </div>
            </div>
          )}
        </div>

        {/* Top Performing Widgets */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Widgets</h2>
          {analyticsData.topWidgets.length > 0 ? (
            <div className="space-y-4">
              {analyticsData.topWidgets.map((widget, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{widget.name}</p>
                    <p className="text-sm text-gray-500">{widget.siteKey}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{widget.chats} chats</p>
                    <p className={`text-sm ${widget.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {widget.growth > 0 ? '+' : ''}{widget.growth}% this week
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Widget Performance</h3>
              <p className="text-gray-600 mb-4">
                Track which of your widgets are performing best with customers.
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>• Chat volume per widget</p>
                <p>• Engagement rates comparison</p>
                <p>• Conversion tracking</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="mt-8 card bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <div className="text-center">
          <ChartBarIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics Coming Soon</h3>
          <p className="text-gray-600 mb-4">
            We're working on detailed charts, conversion tracking, and advanced reporting features.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
            <div>
              <p className="font-medium mb-1">• Conversation Analytics</p>
              <p className="text-xs">Chat duration, response times</p>
            </div>
            <div>
              <p className="font-medium mb-1">• Customer Insights</p>
              <p className="text-xs">Behavior patterns, satisfaction</p>
            </div>
            <div>
              <p className="font-medium mb-1">• Performance Metrics</p>
              <p className="text-xs">Widget comparison, trends</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;