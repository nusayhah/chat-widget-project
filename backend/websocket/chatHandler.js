const WebSocket = require('ws');
const OpenRouterClient = require('../src/ai-client');
const Message = require('../models/Message');
const domainConfig = require('../config/domain');
const jwt = require('jsonwebtoken');

let Session;
try {
  Session = require('../models/Session');
  console.log('✅ Session model loaded successfully');
} catch (error) {
  console.error('❌ Failed to load Session model:', error);
  Session = {
    findBySessionId: () => null,
    create: () => { throw new Error('Session model not loaded'); }
  };
}

class ChatHandler {
  constructor(wss) {
    this.wss = wss;
    this.sessions = new Map();
    this.agents = new Map();
    this.escalatedSessions = new Map();
    this.setupWebSocketHandlers();
  }

 
  broadcastAgentStatus(agentId, status) {
    console.log(`📢 Broadcasting agent ${agentId} status: ${status}`);
  
    this.agents.forEach((agent, id) => {
      if (agent.ws.readyState === WebSocket.OPEN) {
        this.sendMessage(agent.ws, {
          type: 'agent_status_update',
          agentId: agentId,
          status: status,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  setupWebSocketHandlers() {
    this.wss.on('connection', (ws, req) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const path = url.pathname;
    
      console.log(`🔌 New WebSocket connection: ${path}`);
    
      if (path.startsWith('/ws/agent/')) {
        // Handle agent connection with authentication
        this.handleAgentConnection(ws, req);
        return;
      }
    
      if (path.startsWith('/ws/')) {
        const sessionId = path.split('/')[2];
        console.log(`🟡 Customer WebSocket connection for session: ${sessionId}`);
      
        ws.sessionId = sessionId;
        ws.isAlive = true;
      
        ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            this.handleMessage(ws, message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        });
      
        ws.on('close', () => {
          this.handleDisconnection(ws);
        });
      
        ws.on('pong', () => {
          ws.isAlive = true;
        });
      
        // Send welcome message to customer
        this.sendMessage(ws, {
          type: 'message',
          id: 'welcome-' + Date.now(),
          message: 'Welcome! How can I help you today?',
          timestamp: new Date().toISOString()
        });
      
        return;
      }
    
      console.log('❌ Unknown WebSocket connection path:', path);
      ws.close(1002, 'Unknown connection path');
    });
  
    // Keep-alive ping interval
    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 60000);
  }

  handleMessage(ws, message) {
    const { type, sessionId, siteKey } = message;
    
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        ws,
        siteKey,
        messages: [],
        startedAt: new Date(),
        isEscalated: false
      });

      this.ensureDatabaseSession(sessionId, siteKey)
        .then(() => {
          console.log(`🎉 Database session ready for: ${sessionId}`);
        })
        .catch(error => {
          console.error('❌ Failed to create database session:', error.message);
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

  async handleUserMessage(session, message) {
    // Check if session is escalated before processing
    if (session.isEscalated) {
      console.log(`📨 Escalated session ${session.ws.sessionId} - message waiting for agent`);
      
      const userMessage = {
        id: 'msg-' + Date.now(),
        text: message.message,
        sender: 'user',
        timestamp: new Date(),
        sessionId: session.ws.sessionId,
        waitingForAgent: true
      };
      
      session.messages.push(userMessage);
      
      try {
        await Message.create({
          session_id: session.ws.sessionId,
          sender_type: 'visitor',
          message: message.message,
          message_type: 'text',
          metadata: { waitingForAgent: true }
        });
      } catch (error) {
        console.error('❌ Failed to save user message:', error);
      }

      this.notifyAgentsAboutNewMessage(session.ws.sessionId, userMessage);
      
      return; // STOP AI PROCESSING for escalated sessions
    }

    // Normal AI processing for non-escalated sessions
    const userMessage = {
      id: 'msg-' + Date.now(),
      text: message.message,
      sender: 'user',
      timestamp: new Date(),
      sessionId: session.ws.sessionId
    };
  
    session.messages.push(userMessage);
    console.log(`User message in session ${session.ws.sessionId}: ${message.message}`);
  
    try {
      await Message.create({
        session_id: session.ws.sessionId,
        sender_type: 'visitor',
        message: message.message,
        message_type: 'text',
        metadata: { isAI: false }
      });
    } catch (error) {
      console.error('❌ Failed to save user message:', error);
    }
  
    this.sendAgentResponse(session, message.message);
  }

  notifyAgentsAboutNewMessage(sessionId, message) {
    this.agents.forEach((agent, agentId) => {
      this.sendMessage(agent.ws, {
        type: 'new_message',
        sessionId: sessionId,
        message: message,
        timestamp: new Date().toISOString()
      });
    });
  }

  async sendAgentResponse(session, userMessage) {
    console.log(`🎯 sendAgentResponse CALLED for: "${userMessage}"`);
    
    // Don't send AI responses if session is escalated
    if (session.isEscalated) {
      console.log(`🚫 Skipping AI response - session ${session.ws.sessionId} is escalated`);
      return;
    }

    this.sendMessage(session.ws, {
      type: 'typing',
      isTyping: true
    });

    try {
      console.log(`🤖 Getting AI response for: "${userMessage}"`);
      
      const recentMessages = session.messages.slice(-6).map(msg => ({
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.timestamp
      }));

      const aiResult = await OpenRouterClient.generateResponse(
        userMessage, 
        recentMessages, 
        session.ws.sessionId
      );

      if (aiResult.shouldEscalate) {
        console.log(`🚨 AI triggered escalation for session: ${session.ws.sessionId}`);
        
        this.sendMessage(session.ws, {
          type: 'typing',
          isTyping: false
        });

        this.sendMessage(session.ws, {
          type: 'message',
          id: 'ai-' + Date.now(),
          message: aiResult.response,
          timestamp: new Date().toISOString(),
          metadata: {
            agentName: 'AI Assistant',
            isAI: true
          }
        });

        await this.handleAutomaticEscalation(session);
        return;
      }

      const aiResponse = aiResult;
      console.log(`🤖 AI Response: ${aiResponse}`);
      
      this.sendMessage(session.ws, {
        type: 'typing',
        isTyping: false
      });

      setTimeout(async () => {
        if (session.isEscalated) {
          console.log(`🚫 Canceling AI response - session escalated during delay`);
          return;
        }

        const aiMessage = {
          type: 'message',
          id: 'ai-' + Date.now(),
          message: aiResponse,
          timestamp: new Date().toISOString(),
          metadata: {
            agentName: 'AI Assistant',
            isAI: true
          }
        };

        this.sendMessage(session.ws, aiMessage);

        session.messages.push({
          id: aiMessage.id,
          text: aiResponse,
          sender: 'agent',
          timestamp: new Date(),
          sessionId: session.ws.sessionId,
          isAI: true
        });

        try {
          await Message.create({
            session_id: session.ws.sessionId,
            sender_type: 'ai',
            message: aiResponse,
            message_type: 'text',
            metadata: { isAI: true }
          });
        } catch (error) {
          console.error('❌ Failed to save AI message:', error);
        }

      }, 1000 + Math.random() * 1000);

    } catch (error) {
      console.error('❌ AI response failed:', error);
      
      this.sendMessage(session.ws, {
        type: 'typing',
        isTyping: false
      });

      setTimeout(async () => {
        if (session.isEscalated) {
          console.log(`🚫 Canceling fallback response - session escalated during delay`);
          return;
        }

        const fallbackResponse = OpenRouterClient.getFallbackResponse(userMessage);
        
        const fallbackMessage = {
          type: 'message',
          id: 'ai-' + Date.now(),
          message: fallbackResponse,
          timestamp: new Date().toISOString(),
          metadata: {
            agentName: 'AI Assistant',
            isAI: true
          }
        };

        this.sendMessage(session.ws, fallbackMessage);

        session.messages.push({
          id: fallbackMessage.id,
          text: fallbackResponse,
          sender: 'agent',
          timestamp: new Date(),
          sessionId: session.ws.sessionId,
          isAI: true
        });

        try {
          await Message.create({
            session_id: session.ws.sessionId,
            sender_type: 'ai',
            message: fallbackResponse,
            message_type: 'text',
            metadata: { isAI: true }
          });
        } catch (error) {
          console.error('❌ Failed to save fallback message:', error);
        }

      }, 800);
    }
  }

  async handleAutomaticEscalation(session) {
    try {
      console.log(`🚨 Starting automatic escalation for: ${session.ws.sessionId}`);
      
      session.isEscalated = true;
      
      const response = await fetch(
        `${domainConfig.apiUrl}/widgets/escalate/${session.siteKey}/${session.ws.sessionId}`,
        { method: 'POST' }
      );

      if (response.ok) {
        const result = await response.json();
        
        this.sendMessage(session.ws, {
          type: 'queue_update',
          position: result.data.queuePosition,
          estimatedWait: result.data.estimatedWait,
          timestamp: new Date().toISOString()
        });
        this.broadcastQueueUpdate();
        console.log(`✅ Automatic escalation successful for session: ${session.ws.sessionId}`);
      }
    } catch (error) {
      console.error('❌ Automatic escalation failed:', error);
      session.isEscalated = false;
    }
  }

  handleTyping(session, message) {
    console.log(`User typing in session ${session.ws.sessionId}: ${message.isTyping}`);
  }

  handleDisconnection(ws) {
    console.log(`WebSocket disconnected for session: ${ws.sessionId}`);
    
    if (ws.sessionId && this.sessions.has(ws.sessionId)) {
      const session = this.sessions.get(ws.sessionId);
      session.endedAt = new Date();
      setTimeout(() => {
        this.sessions.delete(ws.sessionId);
      }, 300000);
    }
  }

  sendMessage(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  getSessionStats() {
    const escalatedCount = Array.from(this.sessions.values()).filter(s => s.isEscalated).length;
    return {
      activeSessions: this.sessions.size,
      escalatedSessions: escalatedCount,
      totalConnections: this.wss.clients.size
    };
  }

  async ensureDatabaseSession(sessionId, siteKey) {
    try {
      let dbSession = await Session.findBySessionId(sessionId);
    
      if (!dbSession) {
        try {
          dbSession = await Session.create({
            session_id: sessionId,
            site_key: siteKey,
            visitor_info: JSON.stringify({})
          });
        } catch (createError) {
          console.error(`❌ Session creation FAILED:`, createError.message);
          throw createError;
        }
      }
    
      return dbSession;
    } catch (error) {
      console.error(`💥 ensureDatabaseSession FAILED:`, error.message);
      throw error;
    }
  }

  handleAgentConnection(ws, req) {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const path = url.pathname;
      const token = url.searchParams.get('token');
  
      console.log(`🔌 Agent WebSocket connection: ${path}`);
  
      if (!token) {
        console.log('❌ No token provided for agent WebSocket');
        ws.close(1008, 'Authentication required');
        return;
      }
  
      // Verify JWT token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        console.log('❌ Invalid JWT token for agent WebSocket:', error.message);
        ws.close(1008, 'Invalid token');
        return;
      }
  
      // 🆕 ACCEPT BOTH agentId AND userId
      // FIXED VERSION:
      const tokenAgentId = decoded.userId || decoded.agentId;
    
      if (!tokenAgentId) {
        console.log('❌ Token missing both agentId and userId');
        ws.close(1008, 'Invalid token format');
        return;
      }
  
      const pathAgentId = path.split('/').pop();
  
      // Verify agent ID matches token
      if (tokenAgentId.toString() !== pathAgentId) {
        console.log(`❌ Token ID (${tokenAgentId}) doesn't match path agentId (${pathAgentId})`);
        ws.close(1008, 'Agent ID mismatch');
        return;
      }
  
      console.log(`🔵 Agent ${tokenAgentId} authenticated via WebSocket`);
  
      // Set up WebSocket connection
      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
        console.log(`🏓 Keep-alive pong from agent ${tokenAgentId}`);
      }); 
  
      this.agents.set(tokenAgentId, {
        ws,
        activeSessions: new Set(),
        isAvailable: true,
        connectedAt: new Date(),
        lastPing: new Date()
      });

      // Send connection status
      this.sendMessage(ws, {
        type: 'connection_status',
        status: 'connected',
        agentId: tokenAgentId,
        timestamp: new Date().toISOString()
      });

      // Notify all agents about this agent's status
      this.broadcastAgentStatus(tokenAgentId, 'connected');
  
      const agentQueue = require('../utils/agentQueue');
      agentQueue.addAvailableAgent(tokenAgentId);
  
      this.sendMessage(ws, {
        type: 'agent_connected',
        agentId: tokenAgentId,
        timestamp: new Date().toISOString()
      });
  
      this.sendWaitingSessionsToAgent(tokenAgentId);
  
      // Set up message handler
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleAgentMessage(tokenAgentId, message);
        } catch (error) {
          console.error('Failed to parse agent message:', error);
        }
      });
  
      ws.on('close', () => {
        this.handleAgentDisconnection(tokenAgentId);
      });
  
      ws.on('error', (error) => {
        console.error(`WebSocket error for agent ${tokenAgentId}:`, error);
      });
  
      // Keep-alive ping interval
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        } else {
          clearInterval(pingInterval);
        }
      }, 25000);
  
      ws.pingInterval = pingInterval;
    
    } catch (error) {
      console.error('Agent WebSocket connection error:', error);
      ws.close(1011, 'Internal server error');
    }
  }

  sendWaitingSessionsToAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    const Session = require('../models/Session');
    
    Session.getWaitingSessions()
      .then(sessions => {
        this.sendMessage(agent.ws, {
          type: 'waiting_sessions',
          sessions: sessions.map(session => ({
            sessionId: session.session_id,
            siteKey: session.site_key,
            businessName: session.business_name,
            visitorName: session.visitor_name || 'Customer',
            waitingTime: this.calculateWaitingTime(session.started_at),
            addedAt: session.started_at
          })),
          timestamp: new Date().toISOString()
        });
      })
      .catch(error => {
        console.error('Failed to get waiting sessions:', error);
      });
  }

  calculateWaitingTime(startedAt) {
    const started = new Date(startedAt);
    const now = new Date();
    return Math.floor((now - started) / 60000);
  }

  handleAgentMessage(agentId, message) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    console.log(`📨 Agent ${agentId} message:`, message.type);
    
    switch (message.type) {
      case 'agent_identify':
        console.log(`🔵 Agent ${agentId} identified`);
        break;
      case 'get_waiting_sessions':
        this.sendWaitingSessionsToAgent(agentId);
        break;
      case 'accept_chat':
        this.handleAcceptChat(agentId, message.sessionId);
        break;
      case 'send_message':
        this.handleAgentSendMessage(agentId, message);
        break;
      case 'typing_start':
        this.handleAgentTyping(agentId, message, true);
        break;
      case 'typing_stop':
        this.handleAgentTyping(agentId, message, false);
        break;
      case 'return_to_ai':
        this.handleReturnToAI(agentId, message.sessionId);
        break;
      case 'ping':
        console.log(`✅ Ping received from agent ${agentId}`);
        this.sendMessage(agent.ws, {
          type: 'pong',
          timestamp: new Date().toISOString(),
          agentId: agentId
        });
        console.log(`✅ Pong sent to agent ${agentId}`);
        break;
    }
  }

  async handleAcceptChat(agentId, sessionId) {
    const agentQueue = require('../utils/agentQueue');
    const Session = require('../models/Session');
    const Message = require('../models/Message');
  
    try {
      console.log(`🟢 Agent ${agentId} accepting chat: ${sessionId}`);
    
      const success = await Session.assignAgent(sessionId, agentId);
    
      if (success) {
        agentQueue.removeFromQueue(sessionId);
        agentQueue.removeAvailableAgent(agentId);
      
        const session = this.sessions.get(sessionId);
        if (session) {
          session.isEscalated = true;
          session.assignedAgentId = agentId;
        
          const fullMessageHistory = await Message.findBySessionId(sessionId);
        
          const allMessages = [
            ...fullMessageHistory.map(dbMsg => ({
              id: dbMsg.id,
              text: dbMsg.message,
              sender: dbMsg.sender_type === 'visitor' ? 'user' : 
                    (dbMsg.sender_type === 'ai' || dbMsg.sender_type === 'agent') ? 'agent' : 'agent',
              timestamp: new Date(dbMsg.created_at),
              sessionId: sessionId,
              isAI: dbMsg.sender_type === 'ai',
              isAgent: dbMsg.sender_type === 'agent',
              agentId: dbMsg.sender_id,
              fromDatabase: true
            })),
            ...session.messages.filter(msg => !msg.fromDatabase)
          ];
        
          session.messages = allMessages;
        
          this.sendMessage(session.ws, {
            type: 'agent_joined',
            message: 'A support agent has joined the chat! How can I help you?',
            agentName: 'Support Agent',
            timestamp: new Date().toISOString()
          });

          const agent = this.agents.get(agentId);
          if (agent) {
            agent.activeSessions.add(sessionId);
          
            this.sendMessage(agent.ws, {
              type: 'chat_accepted',
              sessionId: sessionId,
              visitorName: session.visitor_name || 'Customer',
              businessName: session.business_name || 'Business',
              messages: allMessages,
              fullHistory: true,
              timestamp: new Date().toISOString()
            });
          }
        }
      
        this.broadcastQueueUpdate();

        // 🆕 ADD THIS: Notify all agents about the assignment
        this.agents.forEach((agent, id) => {
          if (agent.ws.readyState === WebSocket.OPEN) {
            this.sendMessage(agent.ws, {
              type: 'chat_assigned',
              sessionId: sessionId,
              agentId: agentId,
              timestamp: new Date().toISOString()
            });
          }
        });

        console.log(`✅ Chat ${sessionId} assigned to agent ${agentId} with full message history`);
      }
    } catch (error) {
      console.error('❌ Failed to accept chat:', error);
    
      const agent = this.agents.get(agentId);
      if (agent) {
        this.sendMessage(agent.ws, {
          type: 'accept_chat_failed',
          sessionId: sessionId,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  async handleReturnToAI(agentId, sessionId) {
    try {
      console.log(`🔄 Agent ${agentId} returning session ${sessionId} to AI`);
      
      const Session = require('../models/Session');
      
      const query = `
        UPDATE sessions 
        SET assigned_agent_id = NULL, 
            ai_mode = TRUE,
            status = 'active'
        WHERE session_id = ?
      `;
      
      const [result] = await require('../config/database').pool.execute(query, [sessionId]);
      
      if (result.affectedRows > 0) {
        const session = this.sessions.get(sessionId);
        if (session) {
          session.isEscalated = false;
          session.assignedAgentId = null;
          
          this.sendMessage(session.ws, {
            type: 'message',
            id: 'system-' + Date.now(),
            message: 'The support agent has returned you to AI assistance. How can I help you?',
            timestamp: new Date().toISOString(),
            metadata: {
              agentName: 'System',
              isAI: true,
              isSystem: true
            }
          });
        }
        
        const agent = this.agents.get(agentId);
        if (agent) {
          agent.activeSessions.delete(sessionId);
        }
        
        const agentQueue = require('../utils/agentQueue');
        agentQueue.addAvailableAgent(agentId);
        
        if (agent) {
          this.sendMessage(agent.ws, {
            type: 'return_to_ai_success',
            sessionId: sessionId,
            timestamp: new Date().toISOString()
          });
        }
        
        this.broadcastQueueUpdate();

        // 🆕 ADD THIS: Notify all agents about return to AI
        this.agents.forEach((agent, id) => {
          if (agent.ws.readyState === WebSocket.OPEN) {
            this.sendMessage(agent.ws, {
              type: 'chat_returned_to_ai',
              sessionId: sessionId,
              agentId: agentId,
              timestamp: new Date().toISOString()
            });
          }
        });

        console.log(`✅ Session ${sessionId} returned to AI by agent ${agentId}`);
      }
    } catch (error) {
      console.error('❌ Failed to return session to AI:', error);
      
      const agent = this.agents.get(agentId);
      if (agent) {
        this.sendMessage(agent.ws, {
          type: 'return_to_ai_failed',
          sessionId: sessionId,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  handleAgentSendMessage(agentId, message) {
    const { sessionId, text } = message;
    const session = this.sessions.get(sessionId);
    
    if (session && text.trim()) {
      const agentMessage = {
        id: 'msg-' + Date.now(),
        text: text.trim(),
        sender: 'agent',
        timestamp: new Date(),
        sessionId: sessionId,
        agentId: agentId
      };
      
      session.messages.push(agentMessage);

      Message.create({
        session_id: sessionId,
        sender_type: 'agent',
        sender_id: agentId,
        message: text.trim(),
        message_type: 'text',
        metadata: { 
          agentId: agentId,
          isAI: false 
        }
      }).catch(error => {
        console.error('❌ Failed to save agent message to database:', error);
      });
      
      this.sendMessage(session.ws, {
        type: 'message',
        id: agentMessage.id,
        message: text.trim(),
        timestamp: agentMessage.timestamp.toISOString(),
        metadata: {
          agentName: 'Support Agent',
          isAI: false
        }
      });
      
      console.log(`💬 Agent ${agentId} sent message to session ${sessionId}`);
    }
  }

  handleAgentTyping(agentId, message, isTyping) {
    const { sessionId } = message;
    const session = this.sessions.get(sessionId);
    
    if (session) {
      this.sendMessage(session.ws, {
        type: 'typing',
        isTyping: isTyping,
        agentName: 'Support Agent',
        timestamp: new Date().toISOString()
      });
    }
  }

  handleAgentDisconnection(agentId) {
    console.log(`🔴 Agent ${agentId} disconnected`);
    
    const agent = this.agents.get(agentId);
    if (agent) {
      if (agent.ws.pingInterval) {
        clearInterval(agent.ws.pingInterval);
      }
      
      agent.activeSessions.forEach(sessionId => {
        const session = this.sessions.get(sessionId);
        if (session) {
          session.isEscalated = true;
          session.assignedAgentId = null;
          
          this.sendMessage(session.ws, {
            type: 'agent_left',
            message: 'The support agent has left the chat. Please wait for another agent.',
            timestamp: new Date().toISOString()
          });
        }
      });
    }
    
    this.agents.delete(agentId);

    // 🔥 ADD THIS: Notify all agents about disconnection
    this.broadcastAgentStatus(agentId, 'disconnected');
    
    const agentQueue = require('../utils/agentQueue');
    agentQueue.removeAvailableAgent(agentId);
    
    this.broadcastQueueUpdate();
  }

  broadcastQueueUpdate() {
    console.log('📢 BROADCASTING queue update to all agents');
    const agentQueue = require('../utils/agentQueue');
    const queueStats = agentQueue.getQueueStats();
    
    const Session = require('../models/Session');
    
    Session.getWaitingSessions()
      .then(sessions => {
        console.log(`📊 Found ${sessions.length} waiting sessions`);
        
        this.agents.forEach((agent, agentId) => {
          console.log(`📨 Sending real-time update to agent ${agentId}`);
          
          this.sendMessage(agent.ws, {
            type: 'queue_update',
            stats: queueStats,
            timestamp: new Date().toISOString()
          });
          
          this.sendMessage(agent.ws, {
            type: 'waiting_sessions',
            sessions: sessions.map(session => ({
              sessionId: session.session_id,
              siteKey: session.site_key,
              businessName: session.business_name,
              visitorName: session.visitor_name || 'Customer',
              waitingTime: Math.floor((new Date() - new Date(session.escalated_at || session.started_at)) / 60000),
              addedAt: session.started_at
            })),
            timestamp: new Date().toISOString()
          });
        });
      })
      .catch(error => {
        console.error('❌ Failed to broadcast queue update:', error);
      });
  }
}

module.exports = ChatHandler;