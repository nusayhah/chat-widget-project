const WebSocket = require('ws');

class ChatHandler {
  constructor(wss) {
    this.wss = wss;
    this.sessions = new Map(); // sessionId -> { ws, siteKey, messages }
    this.agents = new Map(); // agentId -> { ws, activeSessions }
    
    this.setupWebSocketHandlers();
  }

  setupWebSocketHandlers() {
    this.wss.on('connection', (ws, req) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const sessionId = url.pathname.split('/').pop();
      
      console.log(`New WebSocket connection for session: ${sessionId}`);
      
      ws.sessionId = sessionId;
      ws.isAlive = true;
      
      // Handle incoming messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      });
      
      // Handle connection close
      ws.on('close', () => {
        this.handleDisconnection(ws);
      });
      
      // Handle pong for keepalive
      ws.on('pong', () => {
        ws.isAlive = true;
      });
      
      // Send welcome message
      this.sendMessage(ws, {
        type: 'message',
        id: 'welcome-' + Date.now(),
        message: 'Welcome! An agent will be with you shortly.',
        timestamp: new Date().toISOString()
      });
    });
    
    // Setup keepalive ping
    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
          return ws.terminate();
        }
        
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  handleMessage(ws, message) {
    const { type, sessionId, siteKey } = message;
    
    // Store session info
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        ws,
        siteKey,
        messages: [],
        startedAt: new Date()
      });
    }
    
    const session = this.sessions.get(sessionId);
    
    switch (type) {
      case 'message':
        this.handleUserMessage(session, message);
        break;
        
      case 'typing':
        this.handleTyping(session, message);
        break;
        
      default:
        console.log('Unknown message type:', type);
    }
  }

  handleUserMessage(session, message) {
    // Store message
    const userMessage = {
      id: 'msg-' + Date.now(),
      text: message.message,
      sender: 'user',
      timestamp: new Date(),
      sessionId: session.ws.sessionId
    };
    
    session.messages.push(userMessage);
    
    console.log(`User message in session ${session.ws.sessionId}: ${message.message}`);
    
    // Simulate agent response (in production, this would route to available agents)
    setTimeout(() => {
      this.sendAgentResponse(session, message.message);
    }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
  }

  sendAgentResponse(session, userMessage) {
    // Generate contextual responses based on user message
    const responses = this.generateResponse(userMessage);
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    // Send typing indicator first
    this.sendMessage(session.ws, {
      type: 'typing',
      isTyping: true
    });
    
    // Send actual response after typing delay
    setTimeout(() => {
      this.sendMessage(session.ws, {
        type: 'typing',
        isTyping: false
      });
      
      this.sendMessage(session.ws, {
        type: 'message',
        id: 'agent-' + Date.now(),
        message: response,
        timestamp: new Date().toISOString(),
        metadata: {
          agentName: 'Demo Agent',
          agentAvatar: null
        }
      });
      
      // Store agent message
      session.messages.push({
        id: 'agent-' + Date.now(),
        text: response,
        sender: 'agent',
        timestamp: new Date(),
        sessionId: session.ws.sessionId
      });
      
    }, 1000 + Math.random() * 1000); // Typing delay 1-2 seconds
  }

  generateResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Simple keyword-based responses for demo
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return [
        'Hello! Great to meet you. How can I assist you today?',
        'Hi there! Welcome to our support chat. What can I help you with?',
        'Hey! Thanks for reaching out. What questions do you have?'
      ];
    }
    
    if (message.includes('help') || message.includes('support')) {
      return [
        'I\'d be happy to help! Could you tell me more about what you need assistance with?',
        'Of course! What specific issue are you experiencing?',
        'I\'m here to help. Can you provide more details about your question?'
      ];
    }
    
    if (message.includes('price') || message.includes('cost') || message.includes('pricing')) {
      return [
        'Great question about pricing! Let me connect you with our sales team who can provide detailed information.',
        'I can help with pricing information. What specific plan or service are you interested in?',
        'For the most up-to-date pricing, I\'d recommend checking our pricing page or speaking with our sales team.'
      ];
    }
    
    if (message.includes('demo') || message.includes('test')) {
      return [
        'This is indeed a demo! Pretty cool, right? The widget can be fully customized for your brand.',
        'You\'re testing our chat widget demo. In a real implementation, you\'d be connected to a live agent.',
        'Thanks for trying our demo! The actual widget supports real-time chat with your support team.'
      ];
    }
    
    if (message.includes('bye') || message.includes('goodbye') || message.includes('thanks')) {
      return [
        'You\'re welcome! Feel free to reach out anytime if you have more questions.',
        'Glad I could help! Have a great day and don\'t hesitate to contact us again.',
        'Thank you for chatting with us! We\'re always here when you need support.'
      ];
    }
    
    // Default responses
    return [
      'That\'s an interesting question! Could you provide a bit more context so I can better assist you?',
      'I understand. Let me see how I can help you with that. Can you give me more details?',
      'Thanks for that information. What would you like to know more about?',
      'I\'m here to help! Could you elaborate on what you\'re looking for?',
      'Great question! Let me make sure I understand correctly - could you provide more details?'
    ];
  }

  handleTyping(session, message) {
    // In a real implementation, this would notify agents that user is typing
    console.log(`User typing in session ${session.ws.sessionId}: ${message.isTyping}`);
  }

  handleDisconnection(ws) {
    console.log(`WebSocket disconnected for session: ${ws.sessionId}`);
    
    if (ws.sessionId && this.sessions.has(ws.sessionId)) {
      const session = this.sessions.get(ws.sessionId);
      session.endedAt = new Date();
      // Keep session data for a while for potential reconnection
      setTimeout(() => {
        this.sessions.delete(ws.sessionId);
      }, 300000); // 5 minutes
    }
  }

  sendMessage(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  // Get session statistics
  getSessionStats() {
    return {
      activeSessions: this.sessions.size,
      totalConnections: this.wss.clients.size
    };
  }
}

module.exports = ChatHandler;