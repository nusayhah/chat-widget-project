const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class Agent {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.full_name = data.full_name;
    this.is_online = data.is_online;
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM agents WHERE email = ?';
    try {
      const [rows] = await pool.execute(query, [email]);
      return rows.length > 0 ? new Agent(rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to find agent: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = 'SELECT * FROM agents WHERE id = ?';
    try {
      const [rows] = await pool.execute(query, [id]);
      return rows.length > 0 ? new Agent(rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to find agent: ${error.message}`);
    }
  }

  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      full_name: this.full_name,
      is_online: this.is_online
    };
  }
}

module.exports = Agent;