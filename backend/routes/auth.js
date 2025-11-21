const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
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
    const token = generateToken(user.id);
    
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
    const token = generateToken(user.id);
    
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
    
    // Simple mock agent authentication
    const mockAgents = [
      {
        id: 1,
        email: 'agent@company.com',
        full_name: 'Support Agent',
        role: 'agent'
      },
      {
        id: 2, 
        email: 'agent2@company.com',
        full_name: 'Second Agent',
        role: 'agent'
      }
    ];
    
    // Find agent by email (mock for now)
    const agent = mockAgents.find(a => a.email === email);
    
    if (!agent) {
      return res.status(401).json({
        success: false,
        message: 'Invalid agent credentials'
      });
    }
    
    // For demo - accept any password
    const token = generateToken(agent.id);
    
    console.log('✅ Agent login successful:', agent.email);
    
    res.json({
      success: true,
      message: 'Agent login successful',
      data: {
        agent: agent,
        token
      }
    });
  } catch (error) {
    console.error('Agent login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during agent login'
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

module.exports = router;