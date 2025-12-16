import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import widgetService from '../services/widgetService';
import { copyToClipboard, generateEmbedCode, getWidgetInstallationInstructions } from '../utils/helpers';

const WidgetList = () => {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEmbedModal, setShowEmbedModal] = useState(null);

  useEffect(() => {
    fetchWidgets();
  }, []);

  const fetchWidgets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await widgetService.getWidgets();
      
      if (response.success) {
        setWidgets(response.data.widgets);
      } else {
        throw new Error(response.message || 'Failed to load widgets');
      }
    } catch (error) {
      console.error('Error fetching widgets:', error);
      setError(error.message);
      toast.error('Failed to load widgets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (siteKey, businessName) => {
    if (!window.confirm(`Are you sure you want to delete "${businessName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await widgetService.deleteWidget(siteKey);
      
      if (response.success) {
        setWidgets(widgets.filter(w => w.site_key !== siteKey));
        toast.success('Widget deleted successfully');
      } else {
        throw new Error(response.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete widget error:', error);
      toast.error('Failed to delete widget');
    }
  };

  const toggleStatus = async (siteKey, currentStatus) => {
    try {
      const response = await widgetService.updateWidget(siteKey, {
        is_active: !currentStatus
      });
      
      if (response.success) {
        setWidgets(widgets.map(w => 
          w.site_key === siteKey ? { ...w, is_active: !currentStatus } : w
        ));
        toast.success(`Widget ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        throw new Error(response.message || 'Status update failed');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error('Failed to update widget status');
    }
  };

  const handleCopyEmbedCode = async (siteKey) => {
    const embedCode = generateEmbedCode(siteKey);
    const success = await copyToClipboard(embedCode);
    
    if (success) {
      toast.success('Embed code copied to clipboard!');
    } else {
      toast.error('Failed to copy embed code');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // FIXED Embed Code Modal Component
  const EmbedModal = ({ siteKey, businessName, onClose }) => {
    const instructions = getWidgetInstallationInstructions(siteKey);
    const embedCode = generateEmbedCode(siteKey);

    const handleCopyAll = async () => {
      const success = await copyToClipboard(embedCode);
      if (success) {
        toast.success('Embed code copied to clipboard!');
      } else {
        toast.error('Failed to copy embed code');
      }
    };

    return (
      // FIX 1: Backdrop with proper click handling
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
        data-modal="embed-modal-unique"
        onClick={onClose}  // Clicking backdrop closes modal
      >
        {/* FIX 2: Modal container stops propagation */}
        <div 
          className="bg-white rounded-lg max-w-2xl w-full my-8"
          onClick={(e) => e.stopPropagation()}  // Prevents backdrop click
        >
          {/* FIX 3: Scrollable content with proper height */}
          <div 
            className="max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Install Widget: {businessName}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Site Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Site Key
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono">
                      {siteKey}
                    </code>
                    <button
                      onClick={() => copyToClipboard(siteKey).then(success => 
                        success && toast.success('Site key copied!')
                      )}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Copy Site Key"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Embed Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Embed Code
                  </label>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                      {embedCode}
                    </pre>
                    <button
                      onClick={handleCopyAll}
                      className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Copy Code
                    </button>
                  </div>
                </div>

                {/* Installation Steps */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Installation Steps
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    {instructions.steps.map((step, index) => (
                      <li key={index} className="pl-2">{step}</li>
                    ))}
                  </ol>
                </div>

                {/* Example HTML */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Example Usage
                  </h4>
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    {instructions.example}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* FIX 4: Fixed footer buttons */}
          <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-lg">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="btn-primary"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>Error loading widgets: {error}</p>
          <button 
            onClick={fetchWidgets}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Widgets Grid */}
      {widgets.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {widgets.map((widget) => (
            <div key={widget.site_key} className="card hover:shadow-lg transition-shadow">
              {/* Widget Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: widget.primary_color }}
                  />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {widget.business_name}
                  </h3>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  widget.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {widget.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Widget Info */}
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Title:</span> {widget.widget_title}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Site Key:</span> 
                  <code className="ml-1 px-1 bg-gray-100 rounded text-xs font-mono">
                    {widget.site_key}
                  </code>
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Position:</span> {widget.position}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Created:</span> {formatDate(widget.created_at)}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setShowEmbedModal(widget.site_key)}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  Get Embed Code
                </button>
                
                <button
                  onClick={() => toggleStatus(widget.site_key, widget.is_active)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    widget.is_active
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {widget.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center border-t pt-4">
                <div className="flex space-x-2">
                  <Link
                    to={`/widgets/edit/${widget.site_key}`}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Edit Widget"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleCopyEmbedCode(widget.site_key)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Copy Embed Code"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(widget.site_key, widget.business_name)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Widget"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
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

      {/* Embed Code Modal */}
      {showEmbedModal && (
        <EmbedModal
          siteKey={showEmbedModal}
          businessName={widgets.find(w => w.site_key === showEmbedModal)?.business_name}
          onClose={() => setShowEmbedModal(null)}
        />
      )}
    </div>
  );
};

export default WidgetList;