-- Chat Widget Generator Database Schema
-- Initialize database tables and relationships

CREATE DATABASE IF NOT EXISTS chatdb;
USE chatdb;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Widget configurations table
CREATE TABLE IF NOT EXISTS widget_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    is_active BOOLEAN DEFAULT TRUE
);

-- Agents table
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

-- Chat sessions table
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
    ai_mode BOOLEAN DEFAULT TRUE,
    escalated_at TIMESTAMP NULL,
    FOREIGN KEY (site_key) REFERENCES widget_configs(site_key) ON DELETE CASCADE,
    FOREIGN KEY (assigned_agent_id) REFERENCES agents(id) ON DELETE SET NULL,
    INDEX idx_session_id (session_id),
    INDEX idx_site_key (site_key),
    INDEX idx_status (status)
);

-- Messages table
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
    INDEX idx_created_at (created_at)
);

-- Insert default admin agent
INSERT INTO agents (username, email, password_hash, full_name) VALUES 
('admin', 'admin@chatwidget.com', '$2b$10$rQZ9QmSTnvXhzQYrQqx5/.YxV4dQ9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y', 'System Administrator');

-- Insert sample widget configuration
INSERT INTO widget_configs (site_key, business_name, widget_title, welcome_message) VALUES 
('demo-widget-key', 'Demo Business', 'Chat Support', 'Welcome! How can we assist you today?');