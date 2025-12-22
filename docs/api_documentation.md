# API Documentation - Chat Widget Generator

## 📋 Overview

The Chat Widget Generator API provides RESTful endpoints for widget management, user authentication, chat operations, and agent coordination. All API responses are in JSON format.

**Base URL (Local Development)**: `http://localhost:5000/api`

## 🔐 Authentication

### JWT Tokens
- All authenticated endpoints require JWT token in Authorization header
- Token format: `Bearer <jwt_token>`
- Token expiration: 7 days (configurable)

### Authentication Endpoints

#### Register New Admin User
```http
POST /auth/register
Content-Type: application/json

Request Body:
{
  "username": "admin_user",
  "email": "admin@example.com",
  "password": "secure_password"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "admin_user",
      "email": "admin@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

Admin Login
http

POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "admin@example.com",
  "password": "secure_password"
}

Response: Same as register response with user data and token.

Agent Login
http

POST /auth/agent-login
Content-Type: application/json

Request Body:
{
  "email": "agent@example.com",
  "password": "agent_password"
}

Response:
{
  "success": true,
  "message": "Agent login successful",
  "data": {
    "agent": {
      "id": 1,
      "username": "support_agent",
      "email": "agent@example.com",
      "full_name": "Support Agent"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

Get Current User Profile
http

GET /auth/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin_user",
      "email": "admin@example.com"
    }
  }
}

🎨 Widget Management
List All Widgets (Authenticated)
http

GET /widgets
Authorization: Bearer <token>
Query Parameters:
  page=1 (optional)
  limit=50 (optional)

Response:
{
  "success": true,
  "data": {
    "widgets": [
      {
        "id": 1,
        "site_key": "widget-abc123",
        "business_name": "Acme Corp",
        "widget_title": "Support Chat",
        "welcome_message": "Hello! How can we help?",
        "primary_color": "#007bff",
        "secondary_color": "#6c757d",
        "position": "bottom-right",
        "enable_prechat_form": false,
        "prechat_fields": [],
        "created_at": "2024-01-15T10:30:00Z",
        "is_active": true
      }
    ],
    "stats": {
      "total_widgets": 1,
      "active_widgets": 1,
      "inactive_widgets": 0,
      "total_chats": 15,
      "total_messages": 245,
      "average_response_time": "2.5 min",
      "customer_satisfaction": 4.2
    },
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1
    }
  }
}

Get Single Widget
http

GET /widgets/{siteKey}
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "widget": {
      "id": 1,
      "site_key": "widget-abc123",
      "business_name": "Acme Corp",
      "widget_title": "Support Chat",
      "welcome_message": "Hello! How can we help?",
      "primary_color": "#007bff",
      "secondary_color": "#6c757d",
      "position": "bottom-right",
      "enable_prechat_form": false,
      "prechat_fields": [],
      "created_at": "2024-01-15T10:30:00Z",
      "is_active": true
    }
  }
}

Create New Widget
http

POST /widgets
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "business_name": "New Business",
  "widget_title": "Chat Support",
  "welcome_message": "Welcome! How can we assist you?",
  "primary_color": "#ff6b6b",
  "secondary_color": "#4ecdc4",
  "position": "bottom-left",
  "enable_prechat_form": true,
  "prechat_fields": [
    {
      "name": "name",
      "label": "Your Name",
      "type": "text",
      "required": true
    },
    {
      "name": "email",
      "label": "Email Address",
      "type": "email",
      "required": true
    }
  ]
}

Response:
{
  "success": true,
  "message": "Widget created successfully",
  "data": {
    "widget": {
      "id": 2,
      "site_key": "widget-def456",
      "business_name": "New Business",
      "...": "..."
    }
  }
}

Update Widget
http

PUT /widgets/{siteKey}
Authorization: Bearer <token>
Content-Type: application/json

Request Body: (Partial updates allowed)
{
  "widget_title": "Updated Chat Title",
  "primary_color": "#00ff00",
  "is_active": false
}

Response:
{
  "success": true,
  "message": "Widget updated successfully",
  "data": {
    "widget": {
      "id": 1,
      "site_key": "widget-abc123",
      "business_name": "Acme Corp",
      "widget_title": "Updated Chat Title",
      "...": "..."
    }
  }
}

Delete Widget
http

DELETE /widgets/{siteKey}
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Widget deleted successfully"
}

Get Widget Configuration (Public)
http

GET /widgets/{siteKey}/config

No authentication required - used by widget on customer websites

Response:
{
  "businessName": "Acme Corp",
  "widgetTitle": "Support Chat",
  "welcomeMessage": "Hello! How can we help?",
  "primaryColor": "#007bff",
  "secondaryColor": "#6c757d",
  "position": "bottom-right",
  "enablePrechatForm": false,
  "prechatFields": []
}

Get Widget Statistics
http

GET /widgets/stats/overview
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "stats": {
      "total_widgets": 5,
      "active_widgets": 3,
      "inactive_widgets": 2,
      "total_chats": 150,
      "total_messages": 2450,
      "average_response_time": "2.3 min",
      "customer_satisfaction": 4.5
    }
  }
}

💬 Chat Operations
Escalate Chat to Human
http

POST /widgets/escalate/{siteKey}/{sessionId}
Content-Type: application/json

Called by widget when escalation is needed

Request Body: (Optional additional data)
{
  "reason": "customer_requested_human",
  "customer_frustrated": true
}

Response:
{
  "success": true,
  "message": "Chat escalated to human agent",
  "data": {
    "sessionId": "session_abc123",
    "queuePosition": 2,
    "estimatedWait": 4
  }
}

Get Chat History
http

GET /widgets/sessions/{sessionId}/messages
Authorization: Bearer <token>

Used by agent interface to load chat history

Response:
{
  "success": true,
  "messages": [
    {
      "id": 1,
      "text": "Hello! How can I help?",
      "sender": "agent",
      "timestamp": "2024-01-15T10:30:00Z",
      "isAI": true
    },
    {
      "id": 2,
      "text": "I need help with my order",
      "sender": "customer",
      "timestamp": "2024-01-15T10:31:00Z",
      "isAI": false
    }
  ],
  "customerInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "business": "Acme Corp",
    "waitingTime": "2 minutes"
  }
}

Get Queue Position
http

GET /widgets/queue-position/{siteKey}/{sessionId}

Called by widget to show waiting customers their position

Response:
{
  "success": true,
  "data": {
    "position": 3,
    "estimatedWait": 6
  }
}

Get Queue Stats
http

GET /widgets/{siteKey}/queue-stats
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "stats": {
      "waitingSessions": 5,
      "availableAgents": 2,
      "averageWaitTime": "3.5 minutes"
    }
  }
}

👨‍💼 Agent Operations
Get Agent Statistics
http

GET /agents/stats
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "chatsHandled": 45,
    "activeChats": 2,
    "avgResponseTime": "2.3 min",
    "customerSatisfaction": 4.2
  }
}

Get Waiting Sessions (Queue)
http

GET /agents/waiting-sessions
Authorization: Bearer <token>

Response:
{
  "success": true,
  "sessions": [
    {
      "sessionId": "session_abc123",
      "siteKey": "widget-abc123",
      "businessName": "Acme Corp",
      "visitorName": "Customer",
      "waitingTime": 5,
      "escalated": true,
      "addedAt": "2024-01-15T10:30:00Z"
    }
  ]
}

Get Active Chats
http

GET /agents/active-chats
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "session_id": "session_abc123",
      "site_key": "widget-abc123",
      "visitor_name": "John Doe",
      "business_name": "Acme Corp",
      "messageCount": 15,
      "started_at": "2024-01-15T10:30:00Z",
      "visitor_info": {
        "browser": "Chrome",
        "location": "New York"
      }
    }
  ]
}

🔌 WebSocket API
Connection URLs (Local Development)

    Customer Chat: ws://localhost:5000/ws/{sessionId}

    Agent Connection: ws://localhost:5000/ws/agent/{agentId}?token={jwt_token}

Message Types

From Customer/Widget to Server:
json

{
  "type": "message",
  "sessionId": "session_abc123",
  "siteKey": "widget-abc123",
  "message": "Hello, I need help",
  "timestamp": "2024-01-15T10:30:00Z"
}

json

{
  "type": "typing",
  "sessionId": "session_abc123",
  "isTyping": true
}

From Agent to Server:
json

{
  "type": "accept_chat",
  "sessionId": "session_abc123",
  "agentId": 1,
  "timestamp": "2024-01-15T10:30:00Z"
}

json

{
  "type": "send_message",
  "sessionId": "session_abc123",
  "agentId": 1,
  "text": "How can I help you?",
  "timestamp": "2024-01-15T10:30:00Z"
}

json

{
  "type": "return_to_ai",
  "sessionId": "session_abc123",
  "agentId": 1,
  "timestamp": "2024-01-15T10:30:00Z"
}

From Server to Customer/Widget:
json

{
  "type": "message",
  "id": "msg_123",
  "message": "I'm here to help! What do you need?",
  "timestamp": "2024-01-15T10:30:00Z",
  "metadata": {
    "agentName": "AI Assistant",
    "isAI": true
  }
}

json

{
  "type": "typing",
  "isTyping": true
}

json

{
  "type": "queue_update",
  "position": 2,
  "estimatedWait": 4,
  "timestamp": "2024-01-15T10:30:00Z"
}

json

{
  "type": "agent_joined",
  "message": "A support agent has joined the chat!",
  "agentName": "Support Agent",
  "timestamp": "2024-01-15T10:30:00Z"
}

From Server to Agent:
json

{
  "type": "waiting_sessions",
  "sessions": [...],
  "timestamp": "2024-01-15T10:30:00Z"
}

json

{
  "type": "chat_accepted",
  "sessionId": "session_abc123",
  "visitorName": "Customer",
  "businessName": "Acme Corp",
  "messages": [...],
  "fullHistory": true,
  "timestamp": "2024-01-15T10:30:00Z"
}

json

{
  "type": "new_message",
  "sessionId": "session_abc123",
  "message": {
    "id": "msg_123",
    "text": "I need help!",
    "sender": "customer",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}

json

{
  "type": "connection_status",
  "status": "connected",
  "agentId": 1,
  "timestamp": "2024-01-15T10:30:00Z"
}

📊 Health & Monitoring
Health Check
http

GET /api/health

Response:
{
  "success": true,
  "message": "Chat Widget API is running",
  "timestamp": "2024-01-15T10:30:00Z",
  "environment": "development",
  "domain": "localhost",
  "apiUrl": "http://localhost:5000/api",
  "wsUrl": "ws://localhost:5000"
}

🚨 Error Responses
Common Error Codes

    400 - Bad Request (validation errors)

    401 - Unauthorized (missing or invalid token)

    403 - Forbidden (insufficient permissions)

    404 - Not Found (resource doesn't exist)

    409 - Conflict (duplicate resource)

    500 - Internal Server Error

Error Response Format
json

{
  "success": false,
  "message": "Detailed error message",
  "errors": {
    "field": "Specific field error"
  }
}

Example Error Responses

Validation Error (400):
json

{
  "success": false,
  "message": "Validation error",
  "errors": "Email is invalid, Password must be at least 6 characters"
}

Authentication Error (401):
json

{
  "success": false,
  "message": "Access token required"
}

Not Found (404):
json

{
  "success": false,
  "message": "Widget not found for site key: invalid-key"
}

📝 Rate Limiting

    Rate Limit: 100 requests per 15 minutes per IP

    WebSocket: No rate limiting for established connections

    Authentication Endpoints: Stricter limits apply

Rate Limit Response:
json

{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}

🔒 Security Headers

All responses include security headers:

    Content-Security-Policy

    X-Frame-Options: DENY

    X-Content-Type-Options: nosniff

    X-XSS-Protection: 1; mode=block

📡 CORS Configuration (Local Development)

Allowed origins:

    http://localhost:3000 (Admin UI)

    http://localhost:3002 (Agent UI)

    http://localhost:5000 (API)

    http://localhost (Nginx)

🗄️ Database Schema Reference
Users Table
sql

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

Widget Configs Table
sql

CREATE TABLE widget_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    site_key VARCHAR(255) UNIQUE NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    widget_title VARCHAR(255) DEFAULT 'Chat with us',
    welcome_message TEXT DEFAULT 'Hello! How can we help you today?',
    primary_color VARCHAR(7) DEFAULT '#007bff',
    secondary_color VARCHAR(7) DEFAULT '#6c757d',
    position ENUM('bottom-right', 'bottom-left', 'top-right', 'top-left') DEFAULT 'bottom-right',
    enable_prechat_form BOOLEAN DEFAULT FALSE,
    prechat_fields JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

Sessions Table
sql

CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    site_key VARCHAR(255) NOT NULL,
    visitor_name VARCHAR(255),
    visitor_email VARCHAR(255),
    visitor_info JSON,
    status ENUM('waiting', 'active', 'closed') DEFAULT 'waiting',
    assigned_agent_id INT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    ai_mode BOOLEAN DEFAULT TRUE,
    escalated_at TIMESTAMP NULL
);

Messages Table
sql

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    sender_type ENUM('visitor', 'agent', 'ai') NOT NULL,
    sender_id INT NULL,
    message TEXT NOT NULL,
    message_type ENUM('text', 'file', 'system') DEFAULT 'text',
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Agents Table
sql

CREATE TABLE agents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    is_online BOOLEAN DEFAULT FALSE,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

🎯 Testing Examples
cURL Examples

Create Widget:
bash

curl -X POST http://localhost:5000/api/widgets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "Test Business",
    "widget_title": "Test Chat",
    "primary_color": "#ff0000"
  }'

Escalate Chat:
bash

curl -X POST http://localhost:5000/api/widgets/escalate/widget-abc123/session_123 \
  -H "Content-Type: application/json"

Get Widget Config:
bash

curl http://localhost:5000/api/widgets/widget-abc123/config

JavaScript Fetch Examples

Register User:
javascript

const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'new_user',
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
console.log(data);

Authenticated Request:
javascript

const response = await fetch('http://localhost:5000/api/widgets', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);

🔄 WebSocket Examples
Browser/Widget WebSocket
javascript

const ws = new WebSocket('ws://localhost:5000/ws/session_abc123');

ws.onopen = () => {
  console.log('Connected to chat server');
  
  // Send message
  ws.send(JSON.stringify({
    type: 'message',
    sessionId: 'session_abc123',
    siteKey: 'widget-abc123',
    message: 'Hello!',
    timestamp: new Date().toISOString()
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

Agent WebSocket
javascript

const ws = new WebSocket('ws://localhost:5000/ws/agent/1?token=YOUR_JWT_TOKEN');

ws.onopen = () => {
  console.log('Agent connected');
  
  // Request waiting sessions
  ws.send(JSON.stringify({
    type: 'get_waiting_sessions',
    agentId: 1,
    timestamp: new Date().toISOString()
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'waiting_sessions') {
    console.log('Waiting sessions:', data.sessions);
  }
  
  if (data.type === 'new_message') {
    console.log('New message from customer:', data.message);
  }
};

📚 Additional Resources
SDK/Client Libraries

JavaScript widget is included in the project. For other languages, use the REST API.
Postman Collection

A Postman collection is available in /docs/postman folder with all endpoints pre-configured.
API Changelog

    v1.0.0: Initial release with all core functionality

    All endpoints are versioned for backward compatibility

Support

For API-related issues:

    Check the health endpoint first: http://localhost:5000/api/health

    Verify authentication tokens

    Check CORS configuration

    Review WebSocket connection logs

🔄 Deployment URLs

When deploying to production, update these base URLs:

Production URLs:

    Base URL: https://your-domain.com/api

    WebSocket: wss://your-domain.com/ws

    Admin UI: https://your-domain.com

    Agent UI: https://your-domain.com/agent