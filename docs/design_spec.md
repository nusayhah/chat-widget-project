# Chat Widget System - Design Specification

## System Overview
Build a chat system where businesses can create custom chat widgets for their websites.
The chat starts with AI and can escalate to human agents.

## Main Parts:
1. **Admin UI** - Where businesses design their chat widget
2. **Chat Widget** - The actual chat box that appears on websites
3. **Chat Server** - Handles messages and AI responses
4. **Agent UI** - Where human agents answer chats
5. **Database** - Stores everything (widget settings, chats, users)
6. **Nginx** - Makes everything secure with HTTPS

## How Data Flows:
- Website visitor opens chat → Talks to AI
- If AI can't help → Chat goes to human agent queue
- Human agent answers → Conversation continues

## API Endpoints:
- GET /api/widget/:siteKey - Get widget settings
- POST /api/sessions - Start new chat
- WebSocket - For real-time messaging

## Database Tables:
- widget_configs - Widget colors, messages, settings
- sessions - Chat conversations
- messages - All messages
- agents - Human support staff

## Technology Used:
- React for Admin and Agent interfaces
- Node.js + Socket.IO for real-time chat
- MariaDB database
- Docker for deployment
