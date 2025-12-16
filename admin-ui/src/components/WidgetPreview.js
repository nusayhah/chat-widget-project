import React from 'react';
import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

const WidgetPreview = ({ config }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const getPositionClasses = () => {
    switch (config.position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg h-96 overflow-hidden border-2 border-dashed border-gray-300">
      {/* Simple clean background - NO MOCK CONTENT */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-2xl mb-2">🌐</div>
          <p className="text-sm">Your Website Preview</p>
          <p className="text-xs mt-1">Chat widget will appear here</p>
        </div>
      </div>

      {/* Chat Widget - Uses REAL config data */}
      <div className={`absolute ${getPositionClasses()}`}>
        {/* Chat Window */}
        {isOpen && (
          <div 
            className="mb-4 bg-white rounded-lg shadow-lg w-80 h-96 border border-gray-200"
            style={{ borderTop: `4px solid ${config.primaryColor}` }}
          >
            {/* Header */}
            <div 
              className="p-4 text-white rounded-t-lg flex items-center justify-between"
              style={{ backgroundColor: config.primaryColor }}
            >
              <h3 className="font-medium">{config.widgetTitle}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="p-4 h-64 overflow-y-auto bg-gray-50">
              <div className="mb-4">
                <div 
                  className="inline-block px-3 py-2 rounded-lg text-white text-sm max-w-xs"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  {config.welcomeMessage}
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                />
                <button
                  className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors hover:opacity-90"
                  style={{ backgroundColor: config.primaryColor }}
                  disabled
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-105"
          style={{ backgroundColor: config.primaryColor }}
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default WidgetPreview;