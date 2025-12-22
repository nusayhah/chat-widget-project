# Chat Widget Generator - User Guide

## 📖 Table of Contents
1. [Getting Started](#getting-started)
2. [Admin Dashboard](#admin-dashboard)
3. [Creating Your First Widget](#creating-your-first-widget)
4. [Embedding on Your Website](#embedding-on-your-website)
5. [Agent Interface](#agent-interface)
6. [Chat Management](#chat-management)
7. [Troubleshooting](#troubleshooting)
8. [Local Development](#local-development)

## 🚀 Getting Started

### 1. Access the Admin Dashboard
**Local Development:**
- Open your browser and navigate to: `http://localhost:3000`
- Or: `http://localhost` (through nginx proxy)

**Production/Network Access:**
- Use your computer's IP address: `http://YOUR_IP_ADDRESS:3000`
- Example: `http://192.168.1.100:3000`

### 2. First-Time Setup
1. **Create Admin User:**
   - Go to `http://localhost:3000`
   - Click "Create Account"
   - Fill in: Username, Email, Password
   - Click "Create account"

2. **Default Test Credentials:**
   - Email: `admin@test.com`
   - Password: `password123`

## 🎨 Admin Dashboard

### Navigation Menu
- **🏠 Dashboard**: Overview of your chat system
- **💬 Widgets**: Create and manage chat widgets
- **👥 Users**: Manage admin users (who can also act as agents)
- **📊 Analytics**: View chat performance metrics

### Creating Your First Widget

#### Step 1: Navigate to Widgets
1. Click **Widgets** in the sidebar
2. Click **"Create Widget"** button

#### Step 2: Configure Widget
Fill in the configuration form:

**Basic Information:**
- **Business Name**: Your company name (required)
- **Widget Title**: Displayed in chat header (default: "Chat with us")
- **Welcome Message**: First message users see (default: "Hello! How can we help you today?")

**Appearance:**
- **Primary Color**: Main brand color (default: #007bff = blue)
- **Secondary Color**: Accent color (default: #6c757d = gray)
- **Position**: Where widget appears on page
  - Bottom Right (default)
  - Bottom Left
  - Top Right
  - Top Left

**Pre-chat Form (Optional):**
- Enable to collect visitor info before chat
- Customize fields (name, email, ticket number)

#### Step 3: Live Preview
The right panel shows a real-time preview of your widget. Adjust settings and see immediate changes.

#### Step 4: Save & Get Embed Code
1. Click **"Create Widget"**
2. You'll get a unique **Site Key** (e.g., `widget-abc123def456`)
3. Click **"Get Embed Code"** to copy the installation script

### Managing Widgets

#### Widget List View
- See all your widgets in a grid/card layout
- Status indicators: Active (green) / Inactive (red)
- Quick actions per widget:
  - ✏️ Edit widget settings
  - 📋 Copy embed code
  - 🗑️ Delete widget
  - 🔄 Toggle active status

#### Editing Widgets
1. Click the pencil (✏️) icon on any widget
2. Modify any configuration
3. Click **"Update Widget"**
4. Changes apply immediately to all websites using that widget

#### Embedding Your Widget
1. Copy the embed code from widget details
2. Paste it just before `</body>` tag on your website:

```html
<script defer src="http://localhost/widget.js" data-site-key="YOUR-SITE-KEY"></script>

    Test on the provided test page: http://localhost/test-widget.html

🌐 Embedding on Your Website
Method 1: Simple Embed (Recommended)

Add this single line before </body> tag:
html

<script defer src="http://localhost/widget.js" data-site-key="YOUR-SITE-KEY"></script>

Example:
html

<!DOCTYPE html>
<html>
<head>
    <title>Your Website</title>
</head>
<body>
    <!-- Your website content -->
    
    <!-- Chat Widget - Add this line -->
    <script defer src="http://localhost/widget.js" data-site-key="widget-abc123"></script>
</body>
</html>

Method 2: Multiple Pages with Different Widgets

Use different site keys for different sections of your website:
html

<!-- Homepage -->
<script defer src="http://localhost/widget.js" data-site-key="widget-homepage"></script>

<!-- Product pages -->
<script defer src="http://localhost/widget.js" data-site-key="widget-products"></script>

<!-- Support pages -->
<script defer src="http://localhost/widget.js" data-site-key="widget-support"></script>

Method 3: Advanced Programmatic Control

For developers who need more control:
javascript

// Initialize with custom options
const chatWidget = {
  init: function(siteKey) {
    const script = document.createElement('script');
    script.defer = true;
    script.src = 'http://localhost/widget.js';
    script.setAttribute('data-site-key', siteKey);
    document.body.appendChild(script);
  },
  
  // Custom events you can listen for
  onReady: function(callback) {
    window.addEventListener('chatWidgetReady', callback);
  },
  
  onMessage: function(callback) {
    window.addEventListener('chatWidgetMessage', callback);
  }
};

// Usage
chatWidget.init('your-site-key');
chatWidget.onReady(() => {
  console.log('Chat widget loaded!');
});

Testing Your Widget

Before adding to production, test on:

    Local Test Page: http://localhost/test-widget.html

    Different Browsers: Chrome, Firefox, Safari, Edge

    Mobile Devices: Test on phone/tablet

    Network Conditions: Test with slow connection simulation

👨‍💼 Agent Interface
Agent Login

    Navigate to: http://localhost/agent

    Login with same credentials as Admin UI

    All admin users can also act as agents

Agent Dashboard Layout

Left Sidebar:

    🏠 Dashboard: Your performance stats

    📋 Chat Queue: Waiting customer chats

    💬 Active Chats: Your ongoing conversations

Top Bar Shows:

    Your name/avatar

    Connection status (● Connected/Disconnected)

    Logout button

Handling Customer Chats
Accepting a New Chat

    Go to Chat Queue page

    See list of waiting customers

    Click "Accept Chat" on any session

    Chat window opens automatically

Chat Interface Features

Customer Info Panel:

    Customer name (if provided)

    Business name

    Waiting time

    Email (if collected)

Message Area:

    Real-time messaging

    Message history with timestamps

    AI messages marked with "(AI)"

    Customer messages on left, your messages on right

Input & Controls:

    Type message and press Enter or click Send

    Return to AI button: Send chat back to AI assistant

    Typing indicators show when customer is typing

Managing Multiple Chats

    Handle up to 5 simultaneous chats

    Switch between chats from Active Chats page

    Each chat maintains full history

    No data loss when switching between chats

Escalation Flow

    Customer starts chat → Talks to AI assistant

    AI detects need for human → Automatically escalates

    OR Customer requests agent → "Talk to human" button

    Customer waits in queue → See position and wait time

    Agent accepts → Seamless handover from AI to human

💬 Chat Management
AI Assistant Features

Smart Responses:

    Natural language understanding

    Context-aware conversations

    Multi-turn dialogue support

Automatic Escalation Triggers:

    Customer says "talk to human", "real person", "agent"

    Frustration detected (repeating questions)

    Complex issues (billing, complaints, technical problems)

    Specific keywords: "manager", "supervisor", "refund"

Queue Management:

    First-in, first-out (FIFO) queue

    Estimated wait time display

    Queue position updates in real-time

    Priority handling for VIP customers (future feature)

Customer Experience Journey

Step 1: Website Visit

    Visitor sees chat button (custom position/color)

    Button is non-intrusive, doesn't block content

Step 2: Open Chat

    Click button to open chat window

    See welcome message from AI

    Optional pre-chat form collects name/email

Step 3: AI Conversation

    Natural chat with AI assistant

    AI tries to resolve common questions

    If stuck, suggests human agent

Step 4: Escalation (if needed)

    Smooth transition message

    Queue position and wait time

    Regular updates while waiting

Step 5: Agent Support

    Agent joins with greeting

    Sees full conversation history

    Professional support until resolution

Step 6: Resolution

    Agent closes chat or returns to AI

    Optional satisfaction rating

    Chat transcript available (future feature)

🔧 Troubleshooting
Common Issues & Solutions
Widget Not Loading

Symptoms:

    Chat button doesn't appear

    Console shows errors

    Blank white screen

Solutions:

    Check Site Key: Verify correct site key in embed code

    Network Issues: Check browser console (F12 → Console)

    Script Loading: Ensure script is before </body> tag

    Test Page: Use http://localhost/test-widget.html to verify

    CORS Issues: Check if browser is blocking cross-origin requests

Chat Connection Problems

Symptoms:

    "Connecting..." message stays

    Messages not sending/receiving

    WebSocket errors in console

Solutions:

    Check Connection: Look at agent dashboard connection indicator

    WebSocket URL: Should be ws://localhost:5000

    Firewall: Ensure port 5000 is not blocked

    Refresh: Sometimes simple page refresh fixes it

    Logs: Check docker-compose logs -f server

Agent Login Issues

Symptoms:

    Login fails with "Invalid credentials"

    Stuck on loading screen

    Session timeout errors

Solutions:

    Credentials: Use same as Admin UI login

    Clear Cache: Clear browser cache and cookies

    JWT Token: Check if token exists in localStorage

    Database: Verify user exists in database

    Re-register: Create new user if needed

Performance Issues

Symptoms:

    Slow message delivery

    High CPU/Memory usage

    Database connection errors

Solutions:

    Docker Resources: docker stats to check resource usage

    Database: Check MariaDB connection with mysql -h localhost -P 3307 -u chatuser -pchat123

    Logs: Monitor with docker-compose logs -f

    Restart: docker-compose restart to refresh services

    Cleanup: Remove old containers/images if needed

Debugging Tools
Browser Developer Tools

    Console (F12): See JavaScript errors

    Network Tab: Check API/WebSocket connections

    Application Tab: Check localStorage/sessionStorage

    Elements Tab: Inspect widget DOM structure

Docker Commands
bash

# Check all containers
docker ps

# View logs
docker-compose logs -f
docker-compose logs -f server  # Backend only
docker-compose logs -f agent-ui  # Agent UI only

# Check database
mysql -h localhost -P 3307 -u chatuser -pchat123 chatdb
SHOW TABLES;
SELECT * FROM users;

# Restart services
docker-compose restart
docker-compose restart server  # Restart backend only

API Testing
bash

# Health check
curl http://localhost:5000/api/health

# Test database connection
curl http://localhost:5000/api/widgets

# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'

🖥️ Local Development Setup
Quick Start Commands
bash

# 1. Clone and navigate
git clone <repository>
cd chat-widget-project

# 2. Start all services
docker-compose up -d --build

# 3. Access applications
# Admin UI: http://localhost:3000
# Agent UI: http://localhost/agent
# API: http://localhost:5000/api/health
# Test Widget: http://localhost/test-widget.html

# 4. Stop services
docker-compose down

# 5. Clean everything (including volumes)
docker-compose down -v

Services & Ports
Service	Internal Port	External URL	Description
MariaDB	3306	localhost:3307	Database
Backend	5000	localhost:5000	Node.js API
Admin UI	3000	localhost:3000	React Admin Dashboard
Agent UI	3002	localhost/agent	React Agent Dashboard
Nginx	80	localhost	Reverse Proxy
Environment Variables

Key environment files to configure:

    .env - Root configuration (database, ports)

    backend/.env - Backend server config

    admin-ui/.env - Admin React app config

    agent-ui/.env - Agent React app config

Database Management
bash

# Access MariaDB
mysql -h localhost -P 3307 -u chatuser -pchat123 chatdb

# Common queries
SHOW DATABASES;
USE chatdb;
SHOW TABLES;
DESCRIBE users;
SELECT * FROM widget_configs;

# Backup database
docker exec chat_mariadb mysqldump -u chatuser -pchat123 chatdb > backup.sql

# Restore database
docker exec -i chat_mariadb mysql -u chatuser -pchat123 chatdb < backup.sql

Development Workflow

    Make code changes in respective folders

    Rebuild affected service:
    bash

docker-compose build admin-ui
docker-compose up -d admin-ui

    Test changes in browser

    Check logs for errors

    Commit changes to git

📱 Mobile & Cross-Device Testing
Testing Checklist

    Desktop Browsers: Chrome, Firefox, Safari, Edge

    Mobile Browsers: iOS Safari, Android Chrome

    Tablet Devices: iPad, Android tablets

    Screen Sizes: 320px to 3840px

    Network Conditions: 3G, 4G, WiFi, offline

    Browser Features: Notifications, geolocation

Mobile-Specific Features

    Touch-friendly Interface:

        Large buttons (minimum 44px)

        Adequate spacing between elements

        Swipe gestures for chat history

    Responsive Design:

        Adapts to portrait/landscape

        Optimized for small screens

        Readable font sizes

    Performance:

        Lazy loading of assets

        Optimized images

        Minimal JavaScript payload

🛠️ Advanced Configuration
Customizing AI Behavior

Edit backend/src/ai-client.js to modify:

    Escalation keywords

    Response templates

    Fallback messages

    Conversation flow

Custom Styling

Override widget styles with CSS:
css

/* Example: Custom widget button */
.chat-widget-button {
    background-color: #ff0000 !important;
    border-radius: 25px !important;
}

/* Custom chat window */
.chat-window {
    font-family: 'Custom Font', sans-serif !important;
}

Webhook Integration

Set up webhooks for:

    New chat notifications

    Message delivery confirmations

    Chat escalation alerts

    Customer satisfaction ratings

🔒 Security Best Practices
For Production Deployment

    Use HTTPS: Always serve over SSL/TLS

    Strong Passwords: Enforce password policies

    Rate Limiting: Prevent brute force attacks

    Input Validation: Sanitize all user inputs

    Regular Updates: Keep Docker images updated

    Backup Strategy: Regular database backups

    Access Control: Limit admin user creation

    Audit Logs: Monitor system activity

Data Privacy

    Chat messages stored encrypted

    Personal data anonymized where possible

    GDPR/CCPA compliance considerations

    Data retention policies

    Export/delete customer data functionality

📞 Support & Resources
Getting Help

    Documentation: This user guide

    API Reference: API_DOCUMENTATION.md

    Health Check: http://localhost:5000/api/health

    System Logs: docker-compose logs -f

    Issue Tracker: GitHub issues

Common Tasks Quick Reference

Start/Restart Services:
bash

docker-compose up -d --build
docker-compose restart

Check Status:
bash

docker ps
docker-compose logs -f
curl http://localhost:5000/api/health

Database Operations:
bash

# Backup
docker exec chat_mariadb mysqldump -u chatuser -pchat123 chatdb > backup_$(date +%Y%m%d).sql

# Restore
docker exec -i chat_mariadb mysql -u chatuser -pchat123 chatdb < backup.sql

# Reset (WARNING: Deletes all data)
docker-compose down -v
docker-compose up -d --build

Troubleshooting Commands:
bash

# Check network
ping localhost
curl http://localhost:5000/api/health

# Check containers
docker ps -a
docker logs chat_server

# Check resources
docker stats
df -h
free -h

🎯 Success Tips
For Business Owners

    Strategic Placement: Put widget on contact, pricing, and checkout pages

    Brand Consistency: Match widget colors to your brand

    Clear Messaging: Write friendly, helpful welcome messages

    Agent Training: Train agents on your products and policies

    Monitor Analytics: Check daily for chat volume and satisfaction

For Support Teams

    Quick Responses: Aim for under 2-minute response times

    Professional Tone: Friendly but professional communication

    Problem Solving: Focus on solutions, not just answers

    Knowledge Base: Build internal docs for common issues

    Continuous Improvement: Regular team feedback sessions

For Developers

    Testing: Regular testing on different devices/browsers

    Performance: Monitor load times and resource usage

    Security: Regular security audits and updates

    Documentation: Keep docs updated with changes

    Backup Strategy: Implement automated backups

⚡ Quick Troubleshooting Flowchart

    Widget not showing?
    → Check browser console (F12)
    → Verify site key in embed code
    → Test on http://localhost/test-widget.html

    Can't login?
    → Clear browser cache/cookies
    → Check docker-compose logs -f server
    → Verify database has users

    Chat not connecting?
    → Check WebSocket connection
    → Verify port 5000 is accessible
    → Check docker-compose logs -f server

    Slow performance?
    → Check docker stats for resource usage
    → Monitor database connections
    → Check network latency

    Database issues?
    → Connect: mysql -h localhost -P 3307 -u chatuser -pchat123
    → Check tables: SHOW TABLES;
    → Backup before any major changes

Remember: The test page (http://localhost/test-widget.html) is your best friend for troubleshooting widget issues!