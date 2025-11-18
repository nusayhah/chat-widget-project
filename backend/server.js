const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const WebSocket = require('ws');
const ChatHandler = require('./websocket/chatHandler');

const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const widgetRoutes = require('./routes/widgets');
const agentRoutes = require('./routes/agents'); // âœ… MOVE THIS HERE

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001','http://localhost:3002', 'http://localhost:3000','https://localhost','http://192.168.100.124:3001','http://192.168.100.124:3002','null'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
//app.use('/api/', limiter);

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Chat Widget API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/widgets', widgetRoutes);
app.use('/api/agents', agentRoutes); // âœ… USE IT HERE

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('âŒ Failed to connect to database. Server not started.');
      process.exit(1);
    }

    const server = app.listen(PORT, () => {
      console.log(`ðŸš€ Chat Widget API server running on port ${PORT}`);
      console.log(`ðŸ“Š Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`ðŸ”— Health check: http://localhost:${PORT}/health`);
    });

    // ðŸ†• ADD WEB SOCKET SERVER
    const wss = new WebSocket.Server({ server });
    new ChatHandler(wss);
    console.log(`ðŸ”Œ WebSocket server running on port ${PORT}`);
    
  } catch (error) {
    console.error('âŒ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;