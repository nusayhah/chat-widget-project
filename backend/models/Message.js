const { pool } = require('../config/database');

class Message {
  constructor(data) {
    this.id = data.id;
    this.session_id = data.session_id;
    this.sender_type = data.sender_type;
    this.sender_id = data.sender_id;
    this.message = data.message;
    this.message_type = data.message_type;
    this.metadata = data.metadata;
    this.created_at = data.created_at;
  }

  // 🆕 ADD CREATE METHOD
  static async create(messageData) {
    const {
      session_id,
      sender_type,
      sender_id = null,
      message,
      message_type = 'text',
      metadata = '{}'
    } = messageData;

    const query = `
      INSERT INTO messages (session_id, sender_type, sender_id, message, message_type, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    
    try {
      const [result] = await pool.execute(query, [
        session_id,
        sender_type,
        sender_id,
        message,
        message_type,
        JSON.stringify(metadata)
      ]);
      return await Message.findById(result.insertId);
    } catch (error) {
      throw new Error(`Failed to create message: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = 'SELECT * FROM messages WHERE id = ?';
    
    try {
      const [rows] = await pool.execute(query, [id]);
      if (rows.length > 0) {
        const message = new Message(rows[0]);
        message.metadata = JSON.parse(message.metadata || '{}');
        return message;
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to find message: ${error.message}`);
    }
  }

  static async findBySessionId(sessionId) {
    const query = 'SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC';
    
    try {
      const [rows] = await pool.execute(query, [sessionId]);
      return rows.map(row => {
        const message = new Message(row);
        message.metadata = JSON.parse(message.metadata || '{}');
        return message;
      });
    } catch (error) {
      console.error('Failed to find messages:', error);
      return [];
    }
  }
}

module.exports = Message;