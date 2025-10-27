import React from 'react';
import { ChartBarIcon, UsersIcon, ChatBubbleLeftRightIcon, ClockIcon } from '@heroicons/react/24/outline';

const Analytics = () => {
  // Mock analytics data
  const analyticsData = {
    overview: {
      totalChats: 1247,
      totalMessages: 8934,
      averageResponseTime: '2.3 min',
      customerSatisfaction: '4.2/5'
    },
    recentActivity: [
      { date: '2024-01-21', chats: 45, messages: 234 },
      { date: '2024-01-20', chats: 38, messages: 189 },
      { date: '2024-01-19', chats: 52, messages: 267 },
      { date: '2024-01-18', chats: 41, messages: 198 },
      { date: '2024-01-17', chats: 35, messages: 156 }
    ]
  };

  const overviewCards = [
    {
      title: 'Total Chats',
      value: analyticsData.overview.totalChats,
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Total Messages',
      value: analyticsData.overview.totalMessages,
      icon: UsersIcon,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Avg Response Time',
      value: analyticsData.overview.averageResponseTime,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      change: '-15%'
    },
    {
      title: 'Satisfaction',
      value: analyticsData.overview.customerSatisfaction,
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      change: '+5%'
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-gray-600">
          Monitor your chat widget performance and customer interactions
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {overviewCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${card.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${
                  card.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {card.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
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
        </div>

        {/* Top Performing Widgets */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Widgets</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">E-commerce Store</p>
                <p className="text-sm text-gray-500">ecommerce-widget-456</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">123 chats</p>
                <p className="text-sm text-green-600">+18% this week</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Demo Business</p>
                <p className="text-sm text-gray-500">demo-widget-key</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">45 chats</p>
                <p className="text-sm text-green-600">+12% this week</p>
              </div>
            </div>
          </div>
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
          <div className="flex justify-center space-x-4 text-sm text-gray-500">
            <span>• Conversation Flow Analysis</span>
            <span>• Customer Journey Mapping</span>
            <span>• AI Performance Metrics</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;