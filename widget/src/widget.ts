// Main Widget Loader
interface WidgetConfig {
  siteKey: string;
  apiUrl?: string;
  businessName?: string;
  widgetTitle?: string;
  welcomeMessage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  enablePrechatForm?: boolean;
  prechatFields?: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
  }>;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

class ChatWidget {
  private config: WidgetConfig;
  private container: HTMLElement | null = null;
  private chatWindow: HTMLElement | null = null;
  private isOpen: boolean = false;
  private isMinimized: boolean = true;
  private websocket: WebSocket | null = null;
  private messages: Message[] = [];
  private sessionId: string;

  constructor(config: WidgetConfig) {
    this.config = {
      apiUrl: 'http://localhost:3001/api',
      businessName: 'Support Team',
      widgetTitle: 'Chat with us',
      welcomeMessage: 'Hello! How can we help you today?',
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      position: 'bottom-right',
      enablePrechatForm: false,
      prechatFields: [],
      ...config
    };
    this.sessionId = this.generateSessionId();
    this.init();
  }

  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private async init(): Promise<void> {
    try {
      // Fetch configuration from backend
      await this.fetchWidgetConfig();
      
      // Create widget elements
      this.createWidget();
      
      // Set up WebSocket connection
      this.setupWebSocket();
      
      // Add welcome message
      this.addMessage({
        id: 'welcome',
        text: this.config.welcomeMessage || 'Hello! How can we help you today?',
        sender: 'agent',
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('Failed to initialize chat widget:', error);
    }
  }

  private async fetchWidgetConfig(): Promise<void> {
    try {
      const response = await fetch(`${this.config.apiUrl}/widgets/${this.config.siteKey}/config`);
      if (response.ok) {
        const serverConfig = await response.json();
        this.config = { ...this.config, ...serverConfig };
      }
    } catch (error) {
      console.warn('Failed to fetch widget config, using defaults:', error);
    }
  }

  private createWidget(): void {
    // Create main container
    this.container = document.createElement('div');
    this.container.id = 'chat-widget-container';
    this.container.innerHTML = this.getWidgetHTML();
    
    // Add styles
    this.addStyles();
    
    // Append to body
    document.body.appendChild(this.container);
    
    // Get chat window reference
    this.chatWindow = this.container.querySelector('.chat-window') as HTMLElement;
    
    // Add event listeners
    this.addEventListeners();
  }

  private getWidgetHTML(): string {
    const positionClass = `chat-widget-${this.config.position}`;
    
    return `
      <div class="chat-widget ${positionClass}">
        <!-- Chat Button -->
        <div class="chat-button" id="chat-toggle">
          <svg class="chat-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
          </svg>
          <svg class="close-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>

        <!-- Chat Window -->
        <div class="chat-window">
          <div class="chat-header">
            <div class="chat-header-info">
              <h3>${this.config.widgetTitle}</h3>
              <p>${this.config.businessName}</p>
            </div>
            <button class="minimize-btn" id="minimize-chat">−</button>
          </div>
          
          <div class="chat-messages" id="chat-messages">
            <!-- Messages will be added here -->
          </div>
          
          <div class="chat-input-container">
            <div class="chat-input-wrapper">
              <input 
                type="text" 
                id="chat-input" 
                placeholder="Type your message..." 
                maxlength="500"
              />
              <button id="send-message" class="send-btn">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private addStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      /* Chat Widget Styles */
      #chat-widget-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: 999999;
      }

      .chat-widget {
        position: fixed;
        z-index: 999999;
      }

      .chat-widget-bottom-right {
        bottom: 20px;
        right: 20px;
      }

      .chat-widget-bottom-left {
        bottom: 20px;
        left: 20px;
      }

      .chat-widget-top-right {
        top: 20px;
        right: 20px;
      }

      .chat-widget-top-left {
        top: 20px;
        left: 20px;
      }

      .chat-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: ${this.config.primaryColor};
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
        position: relative;
      }

      .chat-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      }

      .chat-button svg {
        width: 24px;
        height: 24px;
        transition: all 0.3s ease;
      }

      .chat-button .close-icon {
        position: absolute;
        opacity: 0;
        transform: rotate(90deg);
      }

      .chat-button.active .chat-icon {
        opacity: 0;
        transform: rotate(-90deg);
      }

      .chat-button.active .close-icon {
        opacity: 1;
        transform: rotate(0deg);
      }

      .chat-window {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 350px;
        height: 500px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        display: flex;
        flex-direction: column;
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px) scale(0.95);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
      }

      .chat-widget-bottom-left .chat-window,
      .chat-widget-top-left .chat-window {
        right: auto;
        left: 0;
      }

      .chat-widget-top-right .chat-window,
      .chat-widget-top-left .chat-window {
        bottom: auto;
        top: 80px;
      }

      .chat-window.open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
      }

      .chat-window.minimized {
        height: 60px;
      }

      .chat-header {
        background: ${this.config.primaryColor};
        color: white;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
      }

      .chat-header-info h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .chat-header-info p {
        margin: 0;
        font-size: 12px;
        opacity: 0.8;
      }

      .minimize-btn {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      .minimize-btn:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      .chat-messages {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .chat-window.minimized .chat-messages {
        display: none;
      }

      .message {
        max-width: 80%;
        padding: 10px 14px;
        border-radius: 18px;
        font-size: 14px;
        line-height: 1.4;
        word-wrap: break-word;
      }

      .message.user {
        background: ${this.config.primaryColor};
        color: white;
        align-self: flex-end;
        border-bottom-right-radius: 6px;
      }

      .message.agent {
        background: #f1f3f5;
        color: #333;
        align-self: flex-start;
        border-bottom-left-radius: 6px;
      }

      .message-time {
        font-size: 11px;
        opacity: 0.6;
        margin-top: 4px;
        text-align: center;
      }

      .chat-input-container {
        padding: 16px;
        border-top: 1px solid #e9ecef;
        flex-shrink: 0;
      }

      .chat-window.minimized .chat-input-container {
        display: none;
      }

      .chat-input-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      #chat-input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid #ddd;
        border-radius: 20px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
      }

      #chat-input:focus {
        border-color: ${this.config.primaryColor};
      }

      .send-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: ${this.config.primaryColor};
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .send-btn:hover {
        transform: scale(1.05);
      }

      .send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      .send-btn svg {
        width: 16px;
        height: 16px;
      }

      /* Responsive */
      @media (max-width: 480px) {
        .chat-window {
          width: 100vw;
          height: 100vh;
          bottom: 0;
          right: 0;
          left: 0;
          top: 0;
          border-radius: 0;
        }

        .chat-widget-bottom-left .chat-window,
        .chat-widget-top-left .chat-window,
        .chat-widget-top-right .chat-window {
          right: 0;
          left: 0;
        }
      }

      /* Typing indicator */
      .typing-indicator {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 10px 14px;
        background: #f1f3f5;
        border-radius: 18px;
        border-bottom-left-radius: 6px;
        align-self: flex-start;
        max-width: 80px;
      }

      .typing-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #999;
        animation: typing 1.4s infinite ease-in-out;
      }

      .typing-dot:nth-child(1) { animation-delay: -0.32s; }
      .typing-dot:nth-child(2) { animation-delay: -0.16s; }

      @keyframes typing {
        0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
        40% { transform: scale(1); opacity: 1; }
      }
    `;
    
    document.head.appendChild(style);
  }

  private addEventListeners(): void {
    // Toggle chat window
    const toggleBtn = this.container?.querySelector('#chat-toggle') as HTMLElement;
    toggleBtn?.addEventListener('click', () => this.toggleChat());

    // Minimize chat
    const minimizeBtn = this.container?.querySelector('#minimize-chat') as HTMLElement;
    minimizeBtn?.addEventListener('click', () => this.minimizeChat());

    // Send message
    const sendBtn = this.container?.querySelector('#send-message') as HTMLElement;
    const input = this.container?.querySelector('#chat-input') as HTMLInputElement;
    
    sendBtn?.addEventListener('click', () => this.sendMessage());
    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
  }

  private toggleChat(): void {
    const button = this.container?.querySelector('.chat-button') as HTMLElement;
    const window = this.container?.querySelector('.chat-window') as HTMLElement;
    
    if (this.isOpen) {
      this.isOpen = false;
      button?.classList.remove('active');
      window?.classList.remove('open');
    } else {
      this.isOpen = true;
      this.isMinimized = false;
      button?.classList.add('active');
      window?.classList.add('open');
      window?.classList.remove('minimized');
      
      // Focus input when opened
      setTimeout(() => {
        const input = this.container?.querySelector('#chat-input') as HTMLInputElement;
        input?.focus();
      }, 300);
    }
  }

  private minimizeChat(): void {
    const window = this.container?.querySelector('.chat-window') as HTMLElement;
    const minimizeBtn = this.container?.querySelector('#minimize-chat') as HTMLElement;
    
    if (this.isMinimized) {
      this.isMinimized = false;
      window?.classList.remove('minimized');
      if (minimizeBtn) minimizeBtn.textContent = '−';
    } else {
      this.isMinimized = true;
      window?.classList.add('minimized');
      if (minimizeBtn) minimizeBtn.textContent = '+';
    }
  }

  private sendMessage(): void {
    const input = this.container?.querySelector('#chat-input') as HTMLInputElement;
    const message = input?.value.trim();
    
    if (!message) return;
    
    // Add user message
    this.addMessage({
      id: this.generateMessageId(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    });
    
    // Clear input
    if (input) input.value = '';
    
    // Send via WebSocket
    this.sendWebSocketMessage(message);
    
    // Show typing indicator
    this.showTypingIndicator();
  }

  private generateMessageId(): string {
    return 'msg_' + Math.random().toString(36).substr(2, 9);
  }

  private addMessage(message: Message): void {
    this.messages.push(message);
    
    const messagesContainer = this.container?.querySelector('#chat-messages') as HTMLElement;
    if (!messagesContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.sender}`;
    messageElement.innerHTML = `
      <div>${this.escapeHtml(message.text)}</div>
      <div class="message-time">${this.formatTime(message.timestamp)}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private showTypingIndicator(): void {
    const messagesContainer = this.container?.querySelector('#chat-messages') as HTMLElement;
    if (!messagesContainer) return;
    
    const typingElement = document.createElement('div');
    typingElement.className = 'typing-indicator';
    typingElement.id = 'typing-indicator';
    typingElement.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    
    messagesContainer.appendChild(typingElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  private hideTypingIndicator(): void {
    const typingElement = this.container?.querySelector('#typing-indicator');
    typingElement?.remove();
  }

  private setupWebSocket(): void {
    try {
      const wsUrl = `ws://localhost:5000/ws/${this.sessionId}`;
      this.websocket = new WebSocket(wsUrl);
      
      this.websocket.onopen = () => {
        console.log('WebSocket connected');
      };
      
      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      this.websocket.onclose = () => {
        console.log('WebSocket disconnected');
        // Attempt to reconnect after 3 seconds
        setTimeout(() => this.setupWebSocket(), 3000);
      };
      
      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
    }
  }

  private sendWebSocketMessage(message: string): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'message',
        sessionId: this.sessionId,
        siteKey: this.config.siteKey,
        message: message,
        timestamp: new Date().toISOString()
      }));
    }
  }

  private handleWebSocketMessage(data: any): void {
    this.hideTypingIndicator();
    
    switch (data.type) {
      case 'message':
        this.addMessage({
          id: data.id || this.generateMessageId(),
          text: data.message,
          sender: 'agent',
          timestamp: new Date(data.timestamp || Date.now())
        });
        break;
        
      case 'typing':
        if (data.isTyping) {
          this.showTypingIndicator();
        } else {
          this.hideTypingIndicator();
        }
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  // Public API methods
  public open(): void {
    if (!this.isOpen) {
      this.toggleChat();
    }
  }

  public close(): void {
    if (this.isOpen) {
      this.toggleChat();
    }
  }

  public destroy(): void {
    this.websocket?.close();
    this.container?.remove();
  }
}

// Global initialization function
declare global {
  interface Window {
    ChatWidget: typeof ChatWidget;
    initChatWidget: (config: WidgetConfig) => ChatWidget;
  }
}

// Export for use
window.ChatWidget = ChatWidget;
window.initChatWidget = (config: WidgetConfig) => new ChatWidget(config);

// Auto-initialize if config is provided via data attributes
document.addEventListener('DOMContentLoaded', () => {
  const scripts = document.querySelectorAll('script[data-site-key]');
  scripts.forEach((script) => {
    const siteKey = script.getAttribute('data-site-key');
    if (siteKey) {
      new ChatWidget({ siteKey });
    }
  });
});

export default ChatWidget;