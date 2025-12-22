const { pool } = require('../config/database');

class Session {
  constructor(data) {
    this.id = data.id;
    this.session_id = data.session_id;
    this.site_key = data.site_key;
    this.visitor_name = data.visitor_name;
    this.visitor_email = data.visitor_email;
    this.visitor_info = data.visitor_info;
    this.status = data.status;
    this.assigned_agent_id = data.assigned_agent_id;
    this.started_at = data.started_at;
    this.ended_at = data.ended_at;
    this.ai_mode = data.ai_mode;
    this.escalated_at = data.escalated_at;
  }

  // Find session by session_id
  static async findBySessionId(sessionId) {
    const query = 'SELECT * FROM sessions WHERE session_id = ?';
    
    try {
      const [rows] = await pool.execute(query, [sessionId]);
      if (rows.length > 0) {
        const session = new Session(rows[0]);
        session.visitor_info = JSON.parse(session.visitor_info || '{}');
        return session;
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to find session: ${error.message}`);
    }
  }

  // Escalate session to human agent
  static async escalateToHuman(sessionId) {
    const query = `
      UPDATE sessions 
      SET ai_mode = FALSE, status = 'waiting', escalated_at = NOW() 
      WHERE session_id = ?
    `;
    
    try {
      const [result] = await pool.execute(query, [sessionId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to escalate session: ${error.message}`);
    }
  }

  // Add this method to your Session class:
  static async assignAgent(sessionId, agentId) {
    const query = `
      UPDATE sessions 
      SET assigned_agent_id = ?, status = 'active', ai_mode = FALSE 
      WHERE session_id = ?
    `;
  
    try {
      const [result] = await pool.execute(query, [agentId, sessionId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to assign agent: ${error.message}`);
    }
  }


  // 🆕 ADD THIS NEW METHOD for returning to AI
  // RETURN TO AI: Reset chat to AI mode (no agent)
  static async returnToAI(sessionId) {
    const query = `
      UPDATE sessions 
      SET assigned_agent_id = NULL, status = 'waiting', ai_mode = TRUE, escalated_at = NULL 
      WHERE session_id = ?
    `;
  
    try {
      const [result] = await pool.execute(query, [sessionId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to return session to AI: ${error.message}`);
    }
  }

  // Create new session
  static async create(sessionData) {
    const {
      session_id,
      site_key,
      visitor_name = null,
      visitor_email = null,
      visitor_info = '{}'
    } = sessionData;
    
    const query = `
      INSERT INTO sessions (
        session_id, site_key, visitor_name, visitor_email, 
        visitor_info, status, ai_mode, started_at
      ) VALUES (?, ?, ?, ?, ?, 'waiting', TRUE, NOW())
    `;
    
    try {
      const [result] = await pool.execute(query, [
        session_id, site_key, visitor_name, visitor_email, 
        JSON.stringify(visitor_info)
      ]);
      return await Session.findBySessionId(session_id);
    } catch (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }

  // Close session
  static async close(sessionId) {
    const query = `
      UPDATE sessions 
      SET status = 'closed', ended_at = NOW() 
      WHERE session_id = ?
    `;
    
    try {
      const [result] = await pool.execute(query, [sessionId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to close session: ${error.message}`);
    }
  }

  // Get waiting sessions (for agent queue)
  static async getWaitingSessions() {
    const query = `
      SELECT s.*, w.business_name 
      FROM sessions s
      JOIN widget_configs w ON s.site_key = w.site_key
      WHERE s.status = 'waiting' AND s.ai_mode = FALSE
      ORDER BY s.escalated_at ASC
    `;
    
    try {
      const [rows] = await pool.execute(query);
      return rows.map(row => {
        const session = new Session(row);
        session.visitor_info = JSON.parse(session.visitor_info || '{}');
        return session;
      });
    } catch (error) {
      throw new Error(`Failed to get waiting sessions: ${error.message}`);
    }
  }
}

module.exports = Session;