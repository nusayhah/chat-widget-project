# Deployment Guide - Chat Widget Generator (Local Setup)

## 📋 Prerequisites

### Hardware Requirements
- **Minimum**: 2 CPU cores, 4GB RAM, 20GB storage
- **Recommended**: 4 CPU cores, 8GB RAM, 50GB storage

### Software Requirements
- **Operating System**: Ubuntu 22.04 LTS, Windows 10/11, or macOS
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+
- **Ports Available**: 80, 3000, 3002, 5000, 3307

## 🚀 Local Development Setup

### Step 1: Initial Setup

#### 1.1 Clone and Prepare
```bash
# Clone the repository
git clone https://github.com/your-username/chat-widget-project.git
cd chat-widget-project

# Copy environment configuration
cp .env.example .env

1.2 Configure Environment

Edit .env file with these LOCALHOST values:
env

# =============================================
# LOCAL DEVELOPMENT CONFIGURATION
# =============================================

# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=3307
DB_USER=chatuser
DB_PASSWORD=chat123
DB_NAME=chatdb

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_123!
JWT_EXPIRES_IN=7d

# LOCALHOST URLs
DOMAIN=localhost
API_URL=http://localhost:5000/api
WS_URL=ws://localhost:5000
ADMIN_UI_URL=http://localhost:3000
AGENT_UI_URL=http://localhost:3002
WIDGET_URL=http://localhost

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002,http://localhost:5000

# AI Configuration (Optional)
OPENROUTER_API_KEY=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

Step 2: Docker Installation
2.1 Install Docker & Docker Compose

Ubuntu/Debian:
bash

# Install Docker
sudo apt update
sudo apt install docker.io docker-compose -y
sudo systemctl enable docker
sudo systemctl start docker

# Add your user to docker group
sudo usermod -aG docker $USER
# Log out and log back in for changes to take effect

Windows/Mac:

    Download Docker Desktop from docker.com

    Install and restart your computer

2.2 Verify Installation
bash

docker --version
docker-compose --version

Step 3: Start Services
3.1 Build and Start
bash

# Build all containers (first time)
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps

3.2 Verify All Services

All containers should show as "running":

    ✅ chat_mariadb (MariaDB database)

    ✅ chat_server (Node.js backend API)

    ✅ admin_ui (React Admin Dashboard)

    ✅ agent_ui (React Agent Interface)

    ✅ nginx_proxy (Nginx reverse proxy)

Step 4: Initial Access
4.1 Access Applications

Open your browser to these URLs:

    Admin Dashboard: http://localhost:3000

    Agent Interface: http://localhost/agent

    API Health Check: http://localhost:5000/api/health

    Test Widget Page: http://localhost/test-widget.html

4.2 Create First Admin User
bash

# Connect to the database
mysql -h localhost -P 3307 -u chatuser -pchat123 chatdb

# Run SQL to create admin user
INSERT INTO users (username, email, password, created_at, updated_at) 
VALUES ('admin', 'admin@localhost.com', '$2a$12$YourHashedPasswordHere', NOW(), NOW());

To generate a hashed password (replace yourpassword):
bash

# Install bcrypt
npm install -g bcrypt-cli
# or use Python
python3 -c "import bcrypt; print(bcrypt.hashpw(b'yourpassword', bcrypt.gensalt(12)).decode())"

🔧 Local Development Workflow
Daily Development Commands
bash

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service_name]
# Examples:
docker-compose logs -f server
docker-compose logs -f admin-ui
docker-compose logs -f agent-ui

# Rebuild after code changes
docker-compose build [service_name]
docker-compose up -d [service_name]

Database Management
bash

# Access database shell
docker exec -it chat_mariadb mysql -u chatuser -pchat123 chatdb

# Backup database
docker exec chat_mariadb mysqldump -u chatuser -pchat123 chatdb > backup.sql

# Restore database
docker exec -i chat_mariadb mysql -u chatuser -pchat123 chatdb < backup.sql

# Reset database (WARNING: Deletes all data)
docker-compose down -v
docker-compose up -d

🐛 Troubleshooting Common Issues
Issue 1: Port Already in Use
bash

# Check what's using port 3306
sudo lsof -i :3306
# If MariaDB is already installed, we use port 3307 instead
# Update .env: DB_PORT=3307
# Update docker-compose.yml: ports: "3307:3306"

Issue 2: Docker Permission Denied
bash

# Add user to docker group
sudo usermod -aG docker $USER
# Log out and log back in

Issue 3: Container Won't Start
bash

# Check specific container logs
docker logs chat_server
docker logs chat_mariadb

# Common fix: Increase Docker resources
# Docker Desktop → Settings → Resources → Increase Memory/CPU

Issue 4: Database Connection Failed
bash

# Test database connection
mysql -h localhost -P 3307 -u chatuser -pchat123 -e "SHOW DATABASES;"

# If fails, check if container is running
docker ps | grep mariadb

# Restart database container
docker-compose restart mariadb

📁 Project Structure for Local Development
text

chat-widget-project/
├── .env                    # Local environment variables
├── docker-compose.yml      # Local service configuration
├── admin-ui/              # Admin dashboard (React)
│   ├── src/
│   ├── public/
│   └── package.json
├── agent-ui/              # Agent interface (React)
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/               # Node.js API server
│   ├── src/
│   ├── routes/
│   └── package.json
├── nginx/                 # Reverse proxy config
│   └── default.conf
├── mariadb/               # Database schema
│   └── init.sql
└── static/                # Static files (widget.js)

🎯 Quick Start Commands
bash

# ONE-TIME SETUP
git clone <repository>
cd chat-widget-project
cp .env.example .env
# Edit .env with localhost values
docker-compose up -d --build

# DAILY USE
docker-compose up -d          # Start services
docker-compose down           # Stop services
docker-compose logs -f        # View all logs
docker-compose restart [service] # Restart specific service

# TROUBLESHOOTING
docker-compose down -v        # Remove volumes and restart
docker system prune -af       # Clean Docker cache
docker-compose build --no-cache # Force rebuild

🔗 Access URLs Summary
Application	URL	Purpose
Admin Dashboard	http://localhost:3000	Create/manage chat widgets
Agent Interface	http://localhost/agent	Handle customer chats
API Backend	http://localhost:5000/api	REST API endpoints
Health Check	http://localhost:5000/api/health	System status
Test Widget	http://localhost/test-widget.html	Test chat widget
Widget JS	http://localhost/widget.js	Embeddable chat widget
📝 Development Tips
1. Making Code Changes
bash

# After editing any source code:
docker-compose build [service_name]
docker-compose up -d [service_name]

# For React apps (admin-ui/agent-ui), changes might require:
docker-compose build --no-cache admin-ui

2. Testing the Chat Flow

    Open Admin UI: http://localhost:3000

    Create a widget and copy embed code

    Open Test page: http://localhost/test-widget.html

    Start a chat (AI will respond)

    Open Agent UI: http://localhost/agent

    Login and accept the chat

3. Database Schema Updates

If you modify mariadb/init.sql:
bash

docker-compose down -v
docker-compose up -d
# WARNING: This deletes all data!

🚨 Emergency Procedures
Complete Reset
bash

# Stop everything and remove all data
docker-compose down -v
docker system prune -af

# Start fresh
docker-compose up -d --build

Database Corruption
bash

# Stop database-related services
docker-compose stop mariadb server

# Remove database volume
docker volume rm chat-widget-project_mariadb_data

# Restart
docker-compose up -d mariadb
# Wait 30 seconds for initialization
docker-compose up -d server admin-ui agent-ui nginx

Widget Not Loading

    Check browser console (F12 → Console)

    Verify widget.js is accessible: http://localhost/widget.js

    Check API is running: http://localhost:5000/api/health

    Check WebSocket: curl to ws://localhost:5000

📊 Monitoring Local Services
Check Resource Usage
bash

# Docker resource usage
docker stats

# Container logs
docker-compose logs --tail=100

# Database size
docker exec chat_mariadb mysql -u chatuser -pchat123 -e "SELECT table_schema 'Database', SUM(data_length + index_length) / 1024 / 1024 'Size (MB)' FROM information_schema.TABLES GROUP BY table_schema;"

Health Checks
bash

# API health
curl http://localhost:5000/api/health

# Database health
mysql -h localhost -P 3307 -u chatuser -pchat123 -e "SELECT 1" chatdb

# Nginx health
curl -I http://localhost

# React apps
curl -I http://localhost:3000
curl -I http://localhost/agent

🎉 Success Checklist

    Docker and Docker Compose installed

    .env file configured with localhost values

    All containers running (docker-compose ps)

    Admin UI accessible: http://localhost:3000

    Agent UI accessible: http://localhost/agent

    API responding: http://localhost:5000/api/health

    Test widget working: http://localhost/test-widget.html

    Can create admin user and login

    Can create chat widget

    Can start chat conversation

    Agent can accept chats

📞 Local Support
Common Errors & Solutions

"Connection refused" errors:

    Check if services are running: docker-compose ps

    Check port conflicts: sudo lsof -i :PORT

    Restart Docker Desktop/Engine

"Unexpected token '<'" in browser:

    Clear browser cache

    Hard refresh (Ctrl+F5)

    Check nginx is routing correctly

Database errors:

    Check MariaDB logs: docker logs chat_mariadb

    Verify credentials in .env file

    Restart database: docker-compose restart mariadb

Getting Help

    Check logs: docker-compose logs -f

    Verify configuration: Compare with .env.example

    Test each service individually

    Search error messages online