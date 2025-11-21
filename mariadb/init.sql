-- Chat Widget Generator Database Schema - WEEK 5 READY
CREATE DATABASE IF NOT EXISTS chatdb;
USE chatdb;

-- Users table (Weeks 1-2 - UNCHANGED)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Widget configurations (Weeks 1-2 - ADD user_id)
CREATE TABLE IF NOT EXISTS widget_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    site_key VARCHAR(255) UNIQUE NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    widget_title VARCHAR(255) DEFAULT 'Chat with us',
    welcome_message TEXT DEFAULT 'Hello! How can we help you today?',
    primary_color VARCHAR(7) DEFAULT '#007bff',
    secondary_color VARCHAR(7) DEFAULT '#6c757d',
    position ENUM('bottom-right', 'bottom-left', 'top-right', 'top-left') DEFAULT 'bottom-right',
    enable_prechat_form BOOLEAN DEFAULT FALSE,
    prechat_fields JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Agents table (WEEK 5 - NEW)
CREATE TABLE IF NOT EXISTS agents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    is_online BOOLEAN DEFAULT FALSE,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Sessions table (Weeks 3-4 - ADD ai_mode, escalated_at)
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    site_key VARCHAR(255) NOT NULL,
    visitor_name VARCHAR(255),
    visitor_email VARCHAR(255),
    visitor_info JSON,
    status ENUM('waiting', 'active', 'closed') DEFAULT 'waiting',
    assigned_agent_id INT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    ai_mode BOOLEAN DEFAULT TRUE,          -- WEEK 5: Track AI vs Human
    escalated_at TIMESTAMP NULL,            -- WEEK 5: When escalation happened
    FOREIGN KEY (site_key) REFERENCES widget_configs(site_key) ON DELETE CASCADE,
    FOREIGN KEY (assigned_agent_id) REFERENCES agents(id) ON DELETE SET NULL,
    INDEX idx_session_id (session_id),
    INDEX idx_site_key (site_key),
    INDEX idx_status (status),
    INDEX idx_ai_mode (ai_mode),
    INDEX idx_assigned_agent (assigned_agent_id)
);

-- Messages table (Weeks 3-4 - UNCHANGED)
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    sender_type ENUM('visitor', 'agent', 'ai') NOT NULL,
    sender_id INT NULL,
    message TEXT NOT NULL,
    message_type ENUM('text', 'file', 'system') DEFAULT 'text',
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES agents(id) ON DELETE SET NULL,
    INDEX idx_session_id (session_id),
    INDEX idx_created_at (created_at),
    INDEX idx_sender_type (sender_type)
);

-- Agent Availability (WEEK 5 - NEW for queue management)
CREATE TABLE IF NOT EXISTS agent_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_id INT NOT NULL,
    is_available BOOLEAN DEFAULT FALSE,
    current_session_id VARCHAR(255) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    FOREIGN KEY (current_session_id) REFERENCES sessions(session_id) ON DELETE SET NULL,
    UNIQUE KEY unique_agent (agent_id)
);

-- Sample Data
INSERT IGNORE INTO users (id, username, email, password) VALUES 
(1, 'admin', 'admin@chatwidget.com', 'temp_password');

INSERT IGNORE INTO agents (id, username, email, password_hash, full_name, is_online) VALUES 
(1, 'support_agent', 'agent@chatwidget.com', '$2b$12$LQv3c1yqBWVHxkd0L9k7uO9V2rQ2a2N2a2N2a2N2a2N2a2N2a2N2a2', 'Support Agent', TRUE);

INSERT IGNORE INTO widget_configs (id, user_id, site_key, business_name, widget_title, welcome_message) VALUES 
(1, 1, 'demo-widget-key', 'Demo Business', 'Chat Support', 'Welcome! How can we assist you today?');

INSERT IGNORE INTO agent_availability (agent_id, is_available) VALUES (1, TRUE);