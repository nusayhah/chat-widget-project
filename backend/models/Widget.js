const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Widget {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.site_key = data.site_key;
    this.business_name = data.business_name;
    this.widget_title = data.widget_title;
    this.welcome_message = data.welcome_message;
    this.primary_color = data.primary_color;
    this.secondary_color = data.secondary_color;
    this.position = data.position;
    this.enable_prechat_form = data.enable_prechat_form;
    this.prechat_fields = data.prechat_fields;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new widget
  static async create(widgetData, userId) {
    const {
      business_name,
      widget_title = 'Chat with us',
      welcome_message = 'Hello! How can we help you today?',
      primary_color = '#007bff',
      secondary_color = '#6c757d',
      position = 'bottom-right',
      enable_prechat_form = false,
      prechat_fields = '[]'
    } = widgetData;

    const site_key = `widget-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
    
    const query = `
      INSERT INTO widget_configs (
        user_id, site_key, business_name, widget_title, welcome_message,
        primary_color, secondary_color, position, enable_prechat_form,
        prechat_fields, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
    `;
    
    try {
      const [result] = await pool.execute(query, [
        userId, site_key, business_name, widget_title, welcome_message,
        primary_color, secondary_color, position, enable_prechat_form,
        JSON.stringify(prechat_fields)
      ]);
      
      return await Widget.findById(result.insertId);
    } catch (error) {
      throw new Error(`Failed to create widget: ${error.message}`);
    }
  }

  // Find widget by ID
  static async findById(id) {
    const query = 'SELECT * FROM widget_configs WHERE id = ?';
    
    try {
      const [rows] = await pool.execute(query, [id]);
      if (rows.length > 0) {
        const widget = new Widget(rows[0]);
        widget.prechat_fields = JSON.parse(widget.prechat_fields || '[]');
        return widget;
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to find widget: ${error.message}`);
    }
  }

  // Find widget by site key
  static async findBySiteKey(siteKey) {
    const query = 'SELECT * FROM widget_configs WHERE site_key = ?';
    
    try {
      const [rows] = await pool.execute(query, [siteKey]);
      if (rows.length > 0) {
        const widget = new Widget(rows[0]);
        widget.prechat_fields = JSON.parse(widget.prechat_fields || '[]');
        return widget;
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to find widget: ${error.message}`);
    }
  }

  // Find all widgets by user ID
  static async findByUserId(userId, limit = 50, offset = 0) {
    const query = `
      SELECT * FROM widget_configs 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    try {
      const [rows] = await pool.execute(query, [userId, limit, offset]);
      return rows.map(row => {
        const widget = new Widget(row);
        widget.prechat_fields = JSON.parse(widget.prechat_fields || '[]');
        return widget;
      });
    } catch (error) {
      throw new Error(`Failed to find widgets: ${error.message}`);
    }
  }

  // Update widget
  async update(updateData) {
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && key !== 'site_key' && updateData[key] !== undefined) {
        if (key === 'prechat_fields') {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(updateData[key]));
        } else {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      }
    });
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    fields.push('updated_at = NOW()');
    values.push(this.id);
    
    const query = `UPDATE widget_configs SET ${fields.join(', ')} WHERE id = ?`;
    
    try {
      await pool.execute(query, values);
      return await Widget.findById(this.id);
    } catch (error) {
      throw new Error(`Failed to update widget: ${error.message}`);
    }
  }

  // Delete widget
  async delete() {
    const query = 'DELETE FROM widget_configs WHERE id = ?';
    
    try {
      const [result] = await pool.execute(query, [this.id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to delete widget: ${error.message}`);
    }
  }

  // Get widget statistics
  static async getStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_widgets,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_widgets,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_widgets
      FROM widget_configs 
      WHERE user_id = ?
    `;
    
    try {
      const [rows] = await pool.execute(query, [userId]);
      return rows[0];
    } catch (error) {
      throw new Error(`Failed to get widget stats: ${error.message}`);
    }
  }
}

module.exports = Widget;