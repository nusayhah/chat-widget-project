// Centralized domain configuration
const domainConfig = {
  domain: process.env.DOMAIN || 'localhost',
  apiUrl: process.env.API_URL || 'http://localhost:5000/api',
  wsUrl: process.env.WS_URL || 'ws://localhost:5000',
  adminUiUrl: process.env.ADMIN_UI_URL || 'http://localhost:3000',
  agentUiUrl: process.env.AGENT_UI_URL || 'http://localhost:3002',
  widgetUrl: process.env.WIDGET_URL || 'http://localhost:3001'
};

// Helper function to get WebSocket URL for specific session
function getWebSocketUrl(sessionId = '') {
  const baseUrl = domainConfig.wsUrl.replace('http://', 'ws://').replace('https://', 'wss://');
  return sessionId ? `${baseUrl}/ws/${sessionId}` : baseUrl;
}

module.exports = {
  ...domainConfig,
  getWebSocketUrl
};