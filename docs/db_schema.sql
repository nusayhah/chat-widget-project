-- Chat Widget Project Database Schema
-- Week 1: Complete table structure for real-time chat system

CREATE TABLE widget_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    site_key VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL DEFAULT 'Chat with us',
    primary_color VARCHAR(10) DEFAULT '#0066ff',
    secondary_color VARCHAR(10) DEFAULT '#f5f5f5',
    position ENUM('bottom-right', 'bottom-left') DEFAULT 'bottom-right',
    size ENUM('small', 'medium', 'large') DEFAULT 'medium',
    logo_url TEXT,
    welcome_message TEXT DEFAULT 'Hello! How can I help you today?',
    show_prechat BOOLEAN DEFAULT FALSE,
    prechat_fields JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
    id VARCHAR(64) PRIMARY KEY,
    widget_config_id INT,
    status ENUM('ai', 'human', 'closed') DEFAULT 'ai',
    customer_name VARCHAR(100),
    customer_email VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (widget_config_id) REFERENCES widget_configs(id) ON DELETE CASCADE
);

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64),
    content TEXT NOT NULL,
    sender ENUM('user', 'ai', 'agent') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE agents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_online BOOLEAN DEFAULT FALSE,
    last_active DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agent_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_id INT,
    session_id VARCHAR(64),
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME,
    FOREIGN KEY (agent_id) REFERENCES agents(id),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_widget_id ON sessions(widget_config_id);
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_agents_online ON agents(is_online);

