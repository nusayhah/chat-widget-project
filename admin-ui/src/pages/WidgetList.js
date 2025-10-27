import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const WidgetList = () => {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWidgets();
  }, []);

  const fetchWidgets = async () => {
    try {
      // Mock API call - replace with actual API
      const mockWidgets = [
        {
          id: 1,
          siteKey: 'demo-widget-key',
          businessName: 'Demo Business',
          widgetTitle: 'Chat Support',
          primaryColor: '#007bff',
          position: 'bottom-right',
          isActive: true,
          createdAt: '2024-01-15T10:30:00Z',
          totalChats: 45,
          lastUsed: '2024-01-20T14:22:00Z'
        },
        {
          id: 2,
          siteKey: 'ecommerce-widget-456',
          businessName: 'E-commerce Store',
          widgetTitle: 'Customer Support',
          primaryColor: '#28a745',
          position: 'bottom-left',
          isActive: true,
          createdAt: '2024-01-10T09:15:00Z',
          totalChats: 123,
          lastUsed: '2024-01-21T11:45:00Z'
        }
      ];
      
      setWidgets(mockWidgets);
    } catch (error) {
      toast.error('Failed to load widgets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (siteKey) => {
    if (!window.confirm('Are you sure you want to delete this widget?')) {
      return;
    }

    try {
      // Mock API call - replace with actual API
      setWidgets(widgets.filter(w => w.siteKey !== siteKey));
      toast.success('Widget deleted successfully');
    } catch (error) {
      toast.error('Failed to delete widget');
    }
  };

  const toggleStatus = async (siteKey) => {
    try {
      // Mock API call - replace with actual API
      setWidgets(widgets.map(w => 
        w.siteKey === siteKey ? { ...w, isActive: !w.isActive } : w
      ));
      toast.success('Widget status updated');
    } catch (error) {
      toast.error('Failed to update widget status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Widgets</h1>
          <p className="mt-2 text-gray-600">
            Manage your chat widgets and configurations
          </p>
        </div>
        <Link
          to="/widgets/new"
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Widget
        </Link>
      </div>

      {/* Widgets Grid */}
      {widgets.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {widgets.map((widget) => (
            <div key={widget.siteKey} className="card hover:shadow-lg transition-shadow">
              {/* Widget Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: widget.primaryColor }}
                  />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {widget.businessName}
                  </h3>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  widget.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {widget.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Widget Info */}
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Title:</span> {widget.widgetTitle}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Site Key:</span> 
                  <code className="ml-1 px-1 bg-gray-100 rounded text-xs">
                    {widget.siteKey}
                  </code>
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Position:</span> {widget.position}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{widget.totalChats}</p>
                  <p className="text-xs text-gray-600">Total Chats</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(widget.lastUsed)}
                  </p>
                  <p className="text-xs text-gray-600">Last Used</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Link
                    to={`/widgets/edit/${widget.siteKey}`}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Edit Widget"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(widget.siteKey)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Widget"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                
                <button
                  onClick={() => toggleStatus(widget.siteKey)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    widget.isActive
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {widget.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <EyeIcon className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No widgets yet</h3>
          <p className="text-gray-600 mb-4">
            Get started by creating your first chat widget
          </p>
          <Link to="/widgets/new" className="btn-primary">
            Create Your First Widget
          </Link>
        </div>
      )}
    </div>
  );
};

export default WidgetList;