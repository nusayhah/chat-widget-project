const WebSocket = require('ws');
const OpenRouterClient = require('../src/ai-client');
const Message = require('../models/Message');

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

  setupWebSocketHandlers() {
    this.wss.on('connection', (ws, req) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const path = url.pathname;
      
      console.log(`🔌 New WebSocket connection: ${path}`);
      
      if (path.startsWith('/ws/agent/')) {
        const agentId = path.split('/').pop();
        console.log(`🔵 Agent connection detected: ${agentId}`);
        this.handleAgentConnection(ws, agentId);
        return;
      }
      
      if (path.startsWith('/ws/')) {
        const sessionId = path.split('/').pop();
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
      // 🚫 REMOVED: 'escalate' case - No more manual escalation
      default:
        console.log('Unknown message type:', type);
    }
  }

  async handleUserMessage(session, message) {
    // ✅ FIX 2: Check if session is escalated before processing
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
      
      return; // ✅ STOP AI PROCESSING for escalated sessions
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
    
    // ✅ FIX 2: Don't send AI responses if session is escalated
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

      // ✅ FIX 1: AI-powered escalation detection
      const aiResult = await OpenRouterClient.generateResponse(
        userMessage, 
        recentMessages, 
        session.ws.sessionId
      );

      // ✅ FIX 1: Check if AI wants to escalate
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
        return; // ✅ STOP normal AI processing
      }

      const aiResponse = aiResult;
      console.log(`🤖 AI Response: ${aiResponse}`);
      
      this.sendMessage(session.ws, {
        type: 'typing',
        isTyping: false
      });

      setTimeout(async () => {
        // ✅ FIX 2: Double check session state
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

  // ✅ FIX 1: AI-powered automatic escalation
  async handleAutomaticEscalation(session) {
    try {
      console.log(`🚨 Starting automatic escalation for: ${session.ws.sessionId}`);
      
      // ✅ FIX 2: Mark session as escalated immediately
      session.isEscalated = true;
      
      const response = await fetch(
        `http://server:5000/api/widgets/escalate/${session.siteKey}/${session.ws.sessionId}`,
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

  // 🚫 REMOVED: handleEscalation method - No more manual escalation

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

  // ✅ FIX 2: Improved agent connection stability
  handleAgentConnection(ws, agentId) {
    console.log(`🔵 Agent ${agentId} connected to WebSocket`);
  
    this.agents.set(agentId, {
      ws,
      activeSessions: new Set(),
      isAvailable: true,
      connectedAt: new Date(),
      lastPing: new Date()
    });

    const agentQueue = require('../utils/agentQueue');
    agentQueue.addAvailableAgent(agentId);

    this.sendMessage(ws, {
      type: 'agent_connected',
      agentId: agentId,
      timestamp: new Date().toISOString()
    });

    this.sendWaitingSessionsToAgent(agentId);

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleAgentMessage(agentId, message);
      } catch (error) {
        console.error('Failed to parse agent message:', error);
      }
    });

    ws.on('close', () => {
      this.handleAgentDisconnection(agentId);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for agent ${agentId}:`, error);
    });

    ws.on('pong', () => {
      const agent = this.agents.get(agentId);
      if (agent) {
        agent.lastPing = new Date();
      }
    });

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      } else {
        clearInterval(pingInterval);
      }
    }, 25000);

    ws.pingInterval = pingInterval;
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
      // ✅ FIX 2: Return to AI feature
      case 'return_to_ai':
        this.handleReturnToAI(agentId, message.sessionId);
        break;
      default:
        console.log('Unknown agent message type:', message.type);
    }
  }

  async handleAcceptChat(agentId, sessionId) {
    const agentQueue = require('../utils/agentQueue');
    const Session = require('../models/Session');
    const Message = require('../models/Message'); // 🆕 Add this import
  
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
        
          // 🆕 LOAD FULL MESSAGE HISTORY FROM DATABASE
          const fullMessageHistory = await Message.findBySessionId(sessionId);
        
          // 🆕 COMBINE DATABASE MESSAGES WITH CURRENT SESSION MESSAGES
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
        
          // 🆕 UPDATE SESSION WITH COMPLETE HISTORY
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
          
            // 🆕 SEND COMPLETE MESSAGE HISTORY TO AGENT
            this.sendMessage(agent.ws, {
              type: 'chat_accepted',
              sessionId: sessionId,
              visitorName: session.visitor_name || 'Customer',
              businessName: session.business_name || 'Business',
              messages: allMessages, // 🆕 Send full history, not just recent
              fullHistory: true,
              timestamp: new Date().toISOString()
            });
          }
        }
      
        this.broadcastQueueUpdate();
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

  // ✅ FIX 2: Return to AI functionality
  async handleReturnToAI(agentId, sessionId) {
    try {
      console.log(`🔄 Agent ${agentId} returning session ${sessionId} to AI`);
      
      const Session = require('../models/Session');
      
      const query = `
        UPDATE sessions 
        SET assigned_agent_id = NULL, ai_mode = TRUE 
        WHERE session_id = ?
      `;
      
      const [result] = await require('../config/database').pool.execute(query, [sessionId]);
      
      if (result.affectedRows > 0) {
        const session = this.sessions.get(sessionId);
        if (session) {
          session.isEscalated = false; // ✅ Return to AI mode
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


          // 🆕 ADD THIS: Save agent message to database
      Message.create({
        session_id: sessionId,
        sender_type: 'agent',  // Important: 'agent' not 'ai'
        sender_id: agentId,    // Store which agent sent it
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
    
    const agentQueue = require('../utils/agentQueue');
    agentQueue.removeAvailableAgent(agentId);
    
    this.broadcastQueueUpdate();
  }

  broadcastQueueUpdate() {
    console.log('📢 BROADCASTING queue update to all agents');
    const agentQueue = require('../utils/agentQueue');
    const queueStats = agentQueue.getQueueStats();
    
    // 🆕 Force immediate database query instead of cached sessions
    const Session = require('../models/Session');
    
    Session.getWaitingSessions()
      .then(sessions => {
        console.log(`📊 Found ${sessions.length} waiting sessions`);
        
        this.agents.forEach((agent, agentId) => {
          console.log(`📨 Sending real-time update to agent ${agentId}`);
          
          // Send both queue_update and waiting_sessions with fresh data
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
