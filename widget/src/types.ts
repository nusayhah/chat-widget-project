// Type definitions for the chat widget

export interface WidgetConfig {
  siteKey: string;
  apiUrl?: string;
  businessName?: string;
  widgetTitle?: string;
  welcomeMessage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  enablePrechatForm?: boolean;
  prechatFields?: PrechatField[];
}

export interface PrechatField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'select' | 'textarea';
  required: boolean;
  options?: string[];
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  metadata?: {
    agentName?: string;
    agentAvatar?: string;
    attachments?: Attachment[];
  };
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'file';
  size: number;
}

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'agent_joined' | 'agent_left' | 'session_ended';
  sessionId: string;
  siteKey: string;
  message?: string;
  timestamp: string;
  metadata?: any;
}

export interface ChatSession {
  id: string;
  siteKey: string;
  visitorId: string;
  agentId?: string;
  status: 'waiting' | 'active' | 'ended';
  startedAt: Date;
  endedAt?: Date;
  messages: Message[];
}