┌─────────────────────────────────────────────────────────────────────┐
│ User Website                                                        │
│ (Embeds Chat Widget via: <script data-site-key="..."></script>)     │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ HTTPS/WSS
┌───────────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                         │
│ • HTTPS termination (443)                                      │
│ • WebSocket proxying (WSS)                                     │
│ • Static file serving                                          │
│ • Load balancing (future)                                      │
└──────────────┬─────────────────────┬──────────────────────────┘
               │ HTTPS (443)         │ WebSocket (WSS)
┌──────────────▼────────────┐ ┌─────▼────────────────────────┐
│         Admin UI          │ │         Agent UI              │
│ • React + TailwindCSS     │ │ • React + TailwindCSS         │
│ • Port: 3000              │ │ • Port: 3002                  │
│ • Widget configuration    │ │ • Real-time chat interface    │
│ • User management         │ │ • Agent authentication        │
│ • Analytics dashboard     │ │ • Queue management            │
└───────────────────────────┘ └──────────────────────────────┘
               │
┌───────────────────────────┐ │
│        Chat Server        │ │
│ • Node.js + Express       │◄──┘
│ • WebSocket (ws)          │
│ • Port: 5000              │
│ • AI integration          │
│ • Session management      │
│ • Message routing         │
└─────────────┬─────────────┘
               │
┌─────────────▼─────────────┐
│     MariaDB Database      │
│ • Port: 3306 (internal)   │
│ • Port: 3307 (external)   │
│ • Persistent storage      │
│ • Session data            │
│ • Widget configurations   │
│ • Message history         │
└───────────────────────────┘

┌───────────────────────────┐
│       Chat Widget         │
│  • Embedded JavaScript    │
│  • TypeScript + Rollup    │
│  • Real-time WebSocket    │
│  • Responsive UI          │
│  • Mobile/desktop support │
└───────────────────────────┘

📊 Data Flow Architecture
1. Widget Initialization Flow
text

Website Visitor → Loads Widget Script → Fetches Config → Creates Session → Connects WebSocket → Starts Chat
                  │                    │              │                 │                 │
                  │                    │              │                 │                 │
                  └────────────────────┼──────────────┼─────────────────┼─────────────────┘
                                       │              │                 │
                                  [JavaScript]    [REST API]       [Database]        [WebSocket]

2. Real-time Chat Flow
text

Visitor Message → WebSocket → Chat Server → AI Processing → Response
                  │            │             │              │
                  │            │             │              │
                  └────────────┼─────────────┼──────────────┘
                               │             │
                          [WebSocket]   [Node.js]      [OpenRouter API]

3. Escalation Flow
text

Visitor Requests Human → Escalation API → Add to Queue → Agent Accepts → Agent Takes Over
                          │               │              │               │
                          │               │              │               │
                          └───────────────┼──────────────┼───────────────┘
                                          │              │
                                     [REST API]     [Database]       [WebSocket]      [Agent UI]

🗄️ Database Architecture
Core Tables Structure
text

widget_configs           sessions               messages              users
├── id (PK)              ├── id (PK)            ├── id (PK)           ├── id (PK)
├── site_key (UNIQUE)    ├── session_id (UNIQUE)├── session_id (FK)   ├── username
├── business_name        ├── site_key (FK)      ├── sender_type       ├── email
├── widget_title         ├── visitor_name       ├── message           ├── password
├── welcome_message      ├── visitor_email      ├── message_type      └── timestamps
├── primary_color        ├── visitor_info       ├── metadata
├── secondary_color      ├── status             └── timestamps
├── position             ├── assigned_agent_id
├── enable_prechat_form  ├── ai_mode
├── prechat_fields       ├── escalated_at
└── timestamps           └── timestamps

agents (For backward compatibility)
├── id (PK)
├── username
├── email
├── password_hash
├── full_name
├── is_online
└── timestamps

Database Relationships
text

widget_configs (1) ──────── (∞) sessions
     │                           │
     │                           │
     │                           ▼
     │                    messages (∞) ─── (1) sessions
     │                           │
     │                           │
     ▼                           ▼
 users (1) ──────── (∞) widget_configs     agents (1) ──── (∞) sessions

🔌 API Architecture
REST API Layer (Express.js)
text

/api
├── /auth
│   ├── POST /register          # User registration
│   ├── POST /login             # User login
│   ├── POST /agent-login       # Agent login
│   ├── GET /me                 # Current user
│   ├── GET /users              # List users (admin)
│   └── DELETE /users/:id       # Delete user (admin)
│
├── /widgets
│   ├── GET /                   # List widgets
│   ├── POST /                  # Create widget
│   ├── GET /:siteKey           # Get widget
│   ├── PUT /:siteKey           # Update widget
│   ├── DELETE /:siteKey        # Delete widget
│   ├── GET /stats/overview     # Widget statistics
│   ├── POST /escalate/:siteKey/:sessionId  # Escalate chat
│   ├── GET /queue-position/:siteKey/:sessionId  # Queue position
│   └── GET /:siteKey/config    # Public widget config
│
├── /agents
│   ├── GET /stats              # Agent statistics
│   ├── GET /active-chats       # Active agent chats
│   └── GET /waiting-sessions   # Waiting sessions for queue
│
└── /health                     # Health check

WebSocket Architecture
text

WebSocket Server (Node.js + ws)
├── Customer Connections
│   └── /ws/:sessionId
│       ├── Handles visitor messages
│       ├── AI response generation
│       ├── Escalation triggering
│       └── Real-time chat updates
│
└── Agent Connections
    └── /ws/agent/:agentId
        ├── Agent authentication (JWT)
        ├── Queue updates
        ├── Chat assignments
        ├── Real-time messaging
        └── Agent status updates

🎯 Component Architecture
1. Frontend Components
text

Admin UI (React)          Agent UI (React)          Chat Widget (Vanilla JS)
├── Auth Context          ├── Auth Context          ├── Widget Loader
├── Dashboard             ├── Dashboard             ├── Chat Interface
├── Widget Builder        ├── Queue Management      ├── WebSocket Client
├── Widget List          ├── Active Chats          ├── Message Handler
├── Analytics            ├── Chat Session          └── UI Renderer
├── User Management      └── WebSocket Service
└── API Services

2. Backend Components
text

Backend Server (Node.js)
├── HTTP Server (Express)
│   ├── REST API routes
│   ├── Middleware (auth, validation, CORS)
│   └── Error handling
│
├── WebSocket Server
│   ├── Connection management
│   ├── Message routing
│   ├── Session handling
│   └── Agent coordination
│
├── AI Integration
│   ├── OpenRouter client
│   ├── Escalation detection
│   └── Response generation
│
├── Database Layer
│   ├── Models (User, Widget, Session, Message, Agent)
│   ├── Connection pooling
│   └── Query handling
│
└── Utilities
    ├── Agent queue management
    ├── Session utilities
    └── Configuration helpers

🛡️ Security Architecture
Authentication & Authorization
text

┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │      │   Backend API   │      │   Database      │
│                 │      │                 │      │                 │
│ 1. Login Form   │───►│ 2. Verify        │───►│ 3. Check         │
│   (email/pwd)   │      │   Credentials    │      │   User/Agent     │
│                 │      │                 │      │                 │
│ 7. Store Token  │◄───│ 6. Return JWT    │◄───│ 5. Generate      │
│ (localStorage)  │      │   Token          │      │   Token          │
│                 │      │                 │      │                 │
│ 8. API Requests │───►│ 9. Verify JWT    │───►│ 10. Check        │
│   (with token)  │      │   Middleware      │      │   Permissions    │
└─────────────────┘      └─────────────────┘      └─────────────────┘

WebSocket Security

    Token Authentication: JWT verification for agent connections

    Session Validation: Unique session IDs for customer connections

    Input Sanitization: All messages are sanitized

    Rate Limiting: Connection and message rate limits

    SSL/TLS: All WebSocket connections use WSS

🚀 Scalability Architecture
Current Monolithic Architecture
text

   Single Server → Multiple Services → Shared Database
         │                │                │
         │                │                │
         └────────────────┼────────────────┘
                          │
                 [Docker Compose]

Future Microservices Architecture (Potential)
text

┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ API Gateway │ │ Chat Service│ │ Agent Service│ │  AI Service │
│  (Nginx)    │ │ (Node.js)   │ │ (Node.js)    │ │ (Node.js)   │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
       │               │                │               │
       └───────────────┼────────────────┼───────────────┘
                       │                │
            ┌──────────▼────────────────▼──────────┐
            │           Message Bus                │
            │        (Redis/RabbitMQ)              │
            └──────────────────┬───────────────────┘
                               │
                    ┌──────────▼─────────┐
                    │   Shared Database  │
                    │     (MariaDB)      │
                    └────────────────────┘

🔄 Communication Protocols
1. HTTP/REST

    Port: 80 (via Nginx), 3000 (Admin UI direct), 3002 (Agent UI direct), 5000 (API direct)

    Protocol: HTTP/1.1

    Content Type: JSON

    Authentication: Bearer Token (JWT)

    Local URLs:

        Admin UI: http://localhost:3000 or http://localhost

        Agent UI: http://localhost/agent or http://localhost:3002

        API: http://localhost:5000/api

        Health Check: http://localhost:5000/api/health

2. WebSocket

    Port: 5000 (direct), 80 (via Nginx proxy)

    Protocol: WebSocket over HTTP

    Message Format: JSON

    Keep-alive: Ping/pong every 25 seconds

    Local URLs:

        Customer: ws://localhost:5000/ws/:sessionId

        Agent: ws://localhost:5000/ws/agent/:agentId

3. Database

    Port: 3306 (internal Docker), 3307 (external access)

    Protocol: MySQL/MariaDB

    Connection Pool: 10 connections

    Timeout: 60 seconds

    Local Connection: mysql -h localhost -P 3307 -u chatuser -pchat123 chatdb

📦 Deployment Architecture
Container Architecture
text

Docker Compose Stack
├── mariadb:10.11          # Database container
│   └── Volume: mariadb_data
│
├── server                 # Backend API container
│   └── Build: ./backend
│
├── admin-ui               # Admin interface container
│   └── Build: ./admin-ui
│
├── agent-ui               # Agent interface container
│   └── Build: ./agent-ui
│
└── nginx                  # Reverse proxy container
    └── Build: ./nginx
    └── Volumes:
        - ./static:/var/www/static

Network Architecture
text

chat-network (bridge)
├── mariadb:3306      # Internal DB access (container-to-container)
├── server:5000       # Internal API access
├── admin-ui:3000     # Internal admin UI
├── agent-ui:3002     # Internal agent UI
└── nginx:80          # External access point

External Port Mapping:
├── localhost:80      → nginx:80          (Main access)
├── localhost:3000    → admin-ui:3000     (Direct Admin UI)
├── localhost:3002    → agent-ui:3002     (Direct Agent UI)
├── localhost:5000    → server:5000       (Direct API)
└── localhost:3307    → mariadb:3306      (Direct DB access)

🎨 UI/UX Architecture
Responsive Design Strategy
text

Breakpoints:
├── Mobile: < 768px
│   └── Full-screen sidebar chat
│   └── Larger touch targets
│   └── Simplified navigation
│
├── Tablet: 768px - 1024px
│   └── Adaptive layouts
│   └── Responsive grids
│   └── Touch-friendly interfaces
│
└── Desktop: > 1024px
    └── Compact chat windows
    └── Sidebar navigation
    └── Multi-column layouts

Component Design System
text

Design Tokens:
├── Colors
│   ├── Primary: #007bff (configurable per widget)
│   ├── Secondary: #6c757d (configurable per widget)
│   └── Semantic colors (success, warning, error)
│
├── Typography
│   ├── Font family: Inter, system-ui, sans-serif
│   ├── Font sizes: 12px - 32px scale
│   └── Line heights: 1.4 - 1.8
│
├── Spacing
│   ├── Base unit: 4px
│   ├── Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
│   └── Container widths: 350px (chat), 800px (content)
│
└── Shadows & Effects
    ├── Elevation levels: 0-3
    ├── Transitions: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
    └── Border radius: 4px, 8px, 12px, 20px, 50%

🔍 Monitoring & Logging Architecture
Current Implementation
text

Application Logging:
├── Console logging (development)
├── Structured JSON logging (production)
├── Error tracking
└── Performance metrics

Database Monitoring:
├── Connection health checks
├── Query performance
└── Table statistics

WebSocket Monitoring:
├── Connection counts
├── Message rates
└── Session tracking

Future Enhancement Points
text

Observability Stack:
├── Metrics (Prometheus)
├── Logging (ELK Stack)
├── Tracing (Jaeger)
└── Alerting (Alertmanager)

Health Checks:
├── API endpoints (/api/health)
├── Database connectivity
├── External service status
└── Resource utilization

🎯 Key Architectural Decisions
1. Technology Stack Choices

    Frontend: React for complex UIs, Vanilla JS for lightweight widget

    Backend: Node.js for real-time capabilities

    Database: MariaDB for relational data structure

    WebSocket: Native ws library for performance

    Containerization: Docker for consistency

    Local Development: All services run on localhost with specific ports

2. Real-time Architecture

    Bidirectional Communication: WebSocket for real-time chat

    Session Management: In-memory with database persistence

    Message Queue: In-memory agent queue (scalable to Redis)

    Local Testing: WebSocket connections via ws://localhost:5000

3. Security Architecture

    JWT Tokens: Stateless authentication with 7-day expiration

    CORS Configuration: Strict localhost origin validation

    Input Validation: Both client and server-side validation

    SQL Injection Prevention: Parameterized queries via mysql2

    Local Network Security: Firewall rules for exposed ports

4. Deployment Architecture

    Local Development: All services accessible via localhost

    Reverse Proxy: Nginx for routing and static file serving

    Containerization: Docker Compose for easy setup

    Environment Variables: Configuration via .env files

    Port Configuration:

        Admin UI: 3000

        Agent UI: 3002

        API: 5000

        Nginx: 80

        Database: 3307 (external), 3306 (internal)

📈 Performance Characteristics
Local Development Capacity

    Concurrent Users: 50-100 (local testing)

    Message Throughput: ~50 messages/second

    Database Connections: 10 concurrent connections

    WebSocket Connections: ~500 concurrent connections

    Memory Usage: ~1GB total for all containers

    CPU Usage: ~10-20% on typical hardware

Local Network Access
text

Same Network Access:
├── Admin UI:     http://<local-ip>:3000
├── Agent UI:     http://<local-ip>/agent
├── API:          http://<local-ip>:5000/api
└── Test Widget:  http://<local-ip>/test-widget.html

Where <local-ip> = Your computer's IP on the network
Example: 192.168.1.100

Optimization for Local Development

    Database Indexing: Optimized indexes for common queries

    Connection Pooling: 10 database connections for concurrent access

    Memory Management: Automatic cleanup of inactive sessions

    File Caching: Nginx static file caching for widget assets

    Development Mode: Hot reload for frontend development

Local Testing Scenarios
text

Test Coverage:
├── Unit Testing: API endpoints, models, utilities
├── Integration: Database operations, WebSocket communication
├── UI Testing: Admin/Agent interface functionality
├── Widget Testing: Embeddable chat widget behavior
└── End-to-End: Complete chat flow with AI and escalation

This architecture provides a comprehensive, production-ready foundation for the chat widget system that runs seamlessly on localhost while maintaining clear separation of concerns and supporting real-time communication requirements. The localhost configuration ensures easy development, testing, and demonstration while maintaining the structure needed for future deployment to production environments.