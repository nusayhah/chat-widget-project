// src/services/websocketService.js
class WebSocketService {
  constructor() {
    this.socket = null;
    this.agentId = null;
    this.messageHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000;
    this.connectionTimeout = null;
    this.keepAliveInterval = null;
    this.isConnecting = false;
  }

  connect(agentId) {
    if (this.isConnecting) {
      console.log('⏳ WebSocket connection already in progress');
      return;
    }

    if (this.socket) {
      if (this.socket.readyState === WebSocket.OPEN) {
        console.log('✅ WebSocket already connected');
        return;
      }
      if (this.socket.readyState === WebSocket.CONNECTING) {
        console.log('⏳ WebSocket already connecting');
        return;
      }
    }

    console.log('🔌 Creating REAL WebSocket connection for agent:', agentId);
    this.agentId = agentId;
    this.isConnecting = true;

    try {
      // GET REAL TOKEN FROM LOCALSTORAGE
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No authentication token found for WebSocket');
        this.isConnecting = false;
        return;
      }

      console.log('🔑 Using REAL JWT token for WebSocket');
    
      const wsBaseUrl = process.env.REACT_APP_WS_URL || 'wss://192.168.100.124';
      const wsUrl = `${wsBaseUrl}/ws/agent/${agentId}?token=${encodeURIComponent(token)}`;
      console.log('🔗 Connecting to WebSocket:', wsUrl);
    
      this.socket = new WebSocket(wsUrl);

      this.connectionTimeout = setTimeout(() => {
        if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
          console.log('⏰ WebSocket connection timeout');
          this.socket.close();
          this.handleReconnection();
        }
      }, 10000);

      this.socket.onopen = () => {
        console.log('✅ Agent WebSocket CONNECTED with REAL JWT');
        clearTimeout(this.connectionTimeout);
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.isConnecting = false;
      
        this.startKeepAlive();

        // Send authentication confirmation with REAL token
        this.send({
          type: 'agent_identify',
          agentId: agentId,
          token: token,
          timestamp: new Date().toISOString()
        });

        // Request initial queue data
        this.send({
          type: 'get_waiting_sessions',
          agentId: agentId,
          timestamp: new Date().toISOString()
        });
      };

      this.socket.onclose = (event) => {
        console.log('🔴 Agent WebSocket CLOSED - Code:', event.code, 'Reason:', event.reason);
        clearTimeout(this.connectionTimeout);
        this.stopKeepAlive();
        this.isConnecting = false;
        this.handleReconnection();
      };

      this.socket.onerror = (error) => {
        console.error('❌ Agent WebSocket ERROR:', error);
        clearTimeout(this.connectionTimeout);
        this.stopKeepAlive();
        this.isConnecting = false;
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Agent WebSocket MESSAGE:', data.type);
        
          if (data.type === 'pong') {
            console.log('🏓 Received pong from server');
            return;
          }
        
          this.handleMessage(data);
        } catch (error) {
          console.error('❌ Failed to parse agent message:', error);
        }
      };
    
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      this.isConnecting = false;
      this.handleReconnection();
    }
  }
  startKeepAlive() {
    this.keepAliveInterval = setInterval(() => {
      if (this.isConnected()) {
        // Send ping to keep connection alive
        this.send({
          type: 'ping',
          agentId: this.agentId,
          timestamp: new Date().toISOString()
        });
      }
    }, 45000); // Every 45 seconds
  }

  stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      
      const delay = Math.min(this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1), 30000);
      
      console.log(`🔄 Reconnecting in ${delay}ms... (Attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        if (this.agentId && !this.isConnecting) {
          this.connect(this.agentId);
        }
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.notifyConnectionStatus('failed');
    }
  }

  notifyConnectionStatus(status) {
    const handler = this.messageHandlers.get('connection_status');
    if (handler) {
      handler({ status });
    }
  }

  handleMessage(data) {
    const handler = this.messageHandlers.get(data.type);
    if (handler) {
      handler(data);
    } else {
      console.log('No handler for message type:', data.type);
    }
  }

  on(messageType, handler) {
    this.messageHandlers.set(messageType, handler);
  }

  off(messageType) {
    this.messageHandlers.delete(messageType);
  }

  send(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      console.log('📤 Sent message:', message.type);
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message. ReadyState:', this.socket?.readyState);
    }
  }

  acceptChat(sessionId) {
    this.send({
      type: 'accept_chat',
      sessionId: sessionId,
      agentId: this.agentId,
      timestamp: new Date().toISOString()
    });
  }

  returnToAI(sessionId) {
    this.send({
      type: 'return_to_ai',
      sessionId: sessionId,
      agentId: this.agentId,
      timestamp: new Date().toISOString()
    });
  }

  sendMessage(sessionId, text) {
    this.send({
      type: 'send_message',
      sessionId: sessionId,
      text: text,
      agentId: this.agentId,
      timestamp: new Date().toISOString()
    });
  }

  startTyping(sessionId) {
    this.send({
      type: 'typing_start',
      sessionId: sessionId,
      agentId: this.agentId,
      timestamp: new Date().toISOString()
    });
  }

  stopTyping(sessionId) {
    this.send({
      type: 'typing_stop', 
      sessionId: sessionId,
      agentId: this.agentId,
      timestamp: new Date().toISOString()
    });
  }

  requestQueueUpdate() {
    this.send({
      type: 'get_waiting_sessions',
      agentId: this.agentId,
      timestamp: new Date().toISOString()
    });
  }

  cleanup() {
    this.stopKeepAlive();
    clearTimeout(this.connectionTimeout);
    
    if (this.socket) {
      this.socket.close(1000, 'Cleanup');
      this.socket = null;
    }
  }

  disconnect() {
    console.log('🔌 Disconnecting WebSocket...');
    this.cleanup();
    this.messageHandlers.clear();
    this.isConnecting = false;
    this.agentId = null;
  }

  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  getConnectionStatus() {
    if (!this.socket) return 'disconnected';
    
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }
}

const websocketService = new WebSocketService();
export default websocketService;