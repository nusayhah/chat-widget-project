const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const WebSocket = require('ws');
const ChatHandler = require('./websocket/chatHandler');
const domainConfig = require('./config/domain'); // ADD THIS

const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const widgetRoutes = require('./routes/widgets');
const agentRoutes = require('./routes/agents');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration - DYNAMIC
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      domainConfig.adminUiUrl,
      domainConfig.agentUiUrl, 
      domainConfig.widgetUrl,
      `http://${domainConfig.domain}`,
      `https://${domainConfig.domain}`,
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:3002'
    ].filter(Boolean);

    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint with domain info
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Chat Widget API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    domain: domainConfig.domain,
    apiUrl: domainConfig.apiUrl,
    wsUrl: domainConfig.wsUrl
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/widgets', widgetRoutes);
app.use('/api/agents', agentRoutes);

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
      console.error('❌ Failed to connect to database. Server not started.');
      process.exit(1);
    }

    const server = app.listen(PORT, '0.0.0.0', () => { // ADD '0.0.0.0' here
      console.log(`🚀 Chat Widget API server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Domain: ${domainConfig.domain}`);
      console.log(`🔗 API URL: ${domainConfig.apiUrl}`);
      console.log(`📡 WebSocket URL: ${domainConfig.wsUrl}`);
      console.log(`🩺 Health check: http://${domainConfig.domain}:${PORT}/api/health`);
    });

    // WebSocket Server
    const wss = new WebSocket.Server({ server });
    new ChatHandler(wss);
    console.log(`🔄 WebSocket server running on port ${PORT}`);
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;