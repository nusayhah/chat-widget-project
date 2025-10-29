const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new user
  static async create(userData) {
    const { username, email, password } = userData;
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (username, email, password, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
    `;
    
    try {
      const [result] = await pool.execute(query, [username, email, hashedPassword]);
      return await User.findById(result.insertId);
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = ?';
    
    try {
      const [rows] = await pool.execute(query, [id]);
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    
    try {
      const [rows] = await pool.execute(query, [email]);
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  // Verify password
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  // Update user
  async update(updateData) {
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    fields.push('updated_at = NOW()');
    values.push(this.id);
    
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    
    try {
      await pool.execute(query, values);
      return await User.findById(this.id);
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // Get user data without password
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User;