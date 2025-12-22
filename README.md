# Chat Widget Generator + Real-Time Chat Server with AI & Human Escalation

🚀 **A Production-Grade Chat System for Businesses**  
*10-Week Intern Project | Local Development & Production Ready*

## 📋 Project Overview

The **Chat Widget Generator** is a complete, modular chat system that allows businesses to create custom chat widgets for their websites with AI-powered responses and seamless human agent escalation.

### ✨ Key Features

- **Custom Chat Widgets**: Businesses design and embed chat widgets in 2 minutes
- **AI-Powered Conversations**: Smart AI responses using OpenRouter API
- **Human Agent Escalation**: Seamless transfer from AI to human support
- **Real-Time Chat**: WebSocket-based instant messaging
- **Multi-Platform Support**: Desktop and mobile responsive design
- **Secure & Scalable**: Docker containerization with MariaDB
- **Admin Dashboard**: Full control over widgets and analytics
- **Agent Interface**: Dedicated support agent chat portal

## 🏗️ System Architecture

┌──────────────────────────┐
│ User Website │
│ (Embeds Chat Widget) │
└──────────────┬───────────┘
│ HTTPS/WSS
┌─────────▼───────────┐
│ Nginx Reverse Proxy│
│ (SSL + Routing) │
└───────┬────────┬─────┘
│ │
┌────────▼──┐ ┌───▼────────┐
│ Chat Server│ │ Agent UI │
│ Node.js + │ │ React App │
│ Socket.IO │ │ │
└───────┬────┘ └────────────┘
│
┌───────▼─────────┐
│ MariaDB Database │
│ (Widgets, Chats) │
└──────────────────┘
text


## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React + TypeScript + TailwindCSS |
| **Backend** | Node.js + Express + Socket.IO |
| **Database** | MariaDB |
| **AI Integration** | OpenRouter API |
| **Deployment** | Docker Compose + Nginx |
| **Authentication** | JWT |
| **CI/CD** | GitHub Actions |

## 📁 Project Structure

chat-widget-project/
├── admin-ui/ # Widget Builder Dashboard (React)
├── agent-ui/ # Support Agent Interface (React)
├── backend/ # Node.js API + WebSocket Server
├── widget/ # Embeddable Chat Widget (TypeScript)
├── nginx/ # Reverse Proxy Configuration
├── mariadb/ # Database Schema & Initialization
├── static/ # Static files & Test Pages
├── docs/ # Documentation
├── .github/workflows/ # CI/CD Pipeline
├── docker-compose.yml # Production Deployment
└── README.md # This file
text


## 🚀 Quick Start (Local Development)

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for development)
- Git

### 1. Clone & Setup
```bash
git clone <your-repo-url>
cd chat-widget-project
cp .env.example .env
# Edit .env with your local configuration (optional)

2. Start Services
bash

# Build and start all containers
docker-compose up -d --build

# Check container status
docker ps

3. Access Applications (Localhost)

    Admin Dashboard: http://localhost:3000

    Agent Interface: http://localhost/agent

    Widget Test Page: http://localhost/test-widget.html

    API Health Check: http://localhost:5000/api/health

4. Create First Admin User

    Open http://localhost:3000

    Click "Register" to create first admin account

    Login and create your first widget

📊 Database Schema

The system uses 5 main tables:

    users - Admin user accounts

    widget_configs - Widget configurations and settings

    sessions - Chat sessions (AI/Human mode tracking)

    messages - All chat messages

    agents - Support agent accounts (legacy, now using users table)

🔌 API Endpoints
Authentication

    POST /api/auth/register - Register new admin

    POST /api/auth/login - Admin login

    POST /api/auth/agent-login - Agent login

    GET /api/auth/me - Get current user

Widget Management

    GET /api/widgets - List all widgets

    POST /api/widgets - Create new widget

    GET /api/widgets/:siteKey/config - Get widget config (public)

    PUT /api/widgets/:siteKey - Update widget

Chat Operations

    POST /api/widgets/escalate/:siteKey/:sessionId - Escalate to human

    GET /api/widgets/sessions/:sessionId/messages - Get chat history

Agent Operations

    GET /api/agents/stats - Agent statistics

    GET /api/agents/waiting-sessions - Chat queue

    GET /api/agents/active-chats - Active chats

🎯 Key Technical Achievements

✅ Week 1-2: Complete project setup, database design, admin UI
✅ Week 3: Embeddable widget with real-time WebSocket communication
✅ Week 4: AI integration with OpenRouter API
✅ Week 5: Human escalation logic and agent queue
✅ Week 6: Agent interface with live chat capabilities
✅ Week 7: Nginx reverse proxy with localhost routing
✅ Week 8: Docker production setup for local development
✅ Week 9: CI/CD pipeline with GitHub Actions
✅ Week 10: Testing, documentation, and deployment guides
🔒 Security Features

    JWT Authentication: Secure token-based authentication

    CORS Protection: Strict origin validation for localhost

    Input Sanitization: Protection against XSS attacks

    Rate Limiting: Protection against abuse

    Database Security: Prepared statements and parameterized queries

📈 Performance & Scalability

    Load Balanced: Nginx reverse proxy for optimal routing

    WebSocket Optimization: Efficient real-time communication

    Database Indexing: Optimized queries for large datasets

    Containerized: Easy scaling with Docker

    Local Development: Full functionality on localhost

🔧 Development Commands
bash

# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose build admin-ui

# Check database
docker exec -it chat_mariadb mysql -u chatuser -pchat123 chatdb

# Reset everything (warning: deletes data)
docker-compose down -v
docker-compose up -d --build

🐛 Troubleshooting
Port 3306 already in use
bash

# Change MariaDB port in docker-compose.yml
sed -i 's/"3306:3306"/"3307:3306"/' docker-compose.yml
sed -i 's/DB_PORT=3306/DB_PORT=3307/' .env
docker-compose down && docker-compose up -d

Agent UI shows blank page
bash

# Rebuild agent-ui with correct environment
docker-compose build agent-ui
docker-compose up -d agent-ui

WebSocket connection issues

    Ensure port 5000 is accessible

    Check browser console for WebSocket errors

    Verify REACT_APP_WS_URL is set to ws://localhost:5000

🤝 Contributing

    Fork the repository

    Create a feature branch (git checkout -b feature/amazing-feature)

    Commit changes (git commit -m 'Add amazing feature')

    Push to branch (git push origin feature/amazing-feature)

    Open a Pull Request

📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
📞 Support

    Documentation: Check the /docs folder

    Issues: GitHub Issues tracker

    Demo: Access the test widget page for live demonstration

    Local Demo: http://localhost/test-widget.html

🎉 Getting Help

For setup assistance or troubleshooting:

    Check the deployment guide in /docs/DEPLOYMENT_GUIDE.md

    Review the troubleshooting section above

    Test with the included test-widget.html page

    Check container logs: docker-compose logs -f
