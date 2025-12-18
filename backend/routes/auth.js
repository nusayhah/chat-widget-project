const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Agent = require('../models/Agent');
const { generateUserToken, generateAgentToken, generateToken, authenticateToken } = require('../middleware/auth'); 
const { validate, userSchemas } = require('../middleware/validation');

// Register new user
router.post('/register', validate(userSchemas.register), async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Create new user
    const user = await User.create({ username, email, password });
    const token = generateUserToken(user.id); // USE generateUserToken
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

// Login user
router.post('/login', validate(userSchemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Verify password
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Generate token
    const token = generateUserToken(user.id); // USE generateUserToken
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// Agent login route
router.post('/agent-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Agent login attempt:', email);
    
    // Find agent in AGENTS table (not users)
    const agent = await Agent.findByEmail(email);
    
    if (!agent) {
      console.log('❌ Agent not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid agent credentials'
      });
    }
    
    // Verify password against password_hash
    const isPasswordValid = await agent.verifyPassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for agent:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid agent credentials'
      });
    }
    
    // Generate REAL JWT token
    const token = generateAgentToken(agent.id); // USE generateAgentToken
    
    console.log('✅ Agent login successful:', agent.email);
    
    res.json({
      success: true,
      message: 'Agent login successful',
      data: {
        agent: agent.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Agent login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during agent login: ' + error.message
    });
  }
});

// Get current user profile
router.get('/me', require('../middleware/auth').authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.toJSON()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add these routes BEFORE the module.exports line at the bottom

// GET /api/auth/users - Get all users (admin only)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const { pool } = require('../config/database');
    
    // Get all users from database (excluding password for security)
    const [rows] = await pool.execute(
      'SELECT id, username, email, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      data: { users: rows }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// DELETE /api/auth/users/:id - Delete user (admin only)
router.delete('/users/:id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const currentUserId = req.user.id;
    
    // Prevent deleting yourself
    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    
    const { pool } = require('../config/database');
    
    // Check if user exists
    const [checkRows] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );
    
    if (checkRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Delete the user
    const [result] = await pool.execute(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

module.exports = router;