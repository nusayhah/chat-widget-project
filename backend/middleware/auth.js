const jwt = require('jsonwebtoken');
const Agent = require('../models/Agent');
const User = require('../models/User'); // ADD THIS IMPORT

// ========== AGENT AUTHENTICATION ==========
const authenticateAgent = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's a user token OR agent token
    let agent = null;
    
    if (decoded.userId) {
      // User from users table - treat as agent
      const User = require('../models/User');
      const user = await User.findById(decoded.userId);
      if (user) {
        agent = {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name || user.username
        };
      }
    } else if (decoded.agentId) {
      // Legacy agent from agents table
      const Agent = require('../models/Agent');
      const agentFromDb = await Agent.findById(decoded.agentId);
      if (agentFromDb) {
        agent = agentFromDb.toJSON();
      }
    }
    
    if (!agent) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - agent/user not found'
      });
    }

    req.agent = agent;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Invalid token format'
      });
    }
    
    return res.status(403).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// ========== USER AUTHENTICATION ==========
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's a user token (prefer userId, fallback to agentId for backward compatibility)
    if (!decoded.userId && !decoded.agentId) {
      return res.status(403).json({
        success: false,
        message: 'Invalid token format'
      });
    }
    
    // Look for user
    const userId = decoded.userId || decoded.agentId; // Handle both for backward compatibility
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Invalid token format'
      });
    }
    
    return res.status(403).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// ========== BACKWARD COMPATIBLE AUTHENTICATION ==========
const authenticateToken = async (req, res, next) => {
  // Try to authenticate as user first, then as agent
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try user first (for backward compatibility with existing /me route)
    if (decoded.userId || decoded.agentId) {
      const userId = decoded.userId || decoded.agentId;
      const user = await User.findById(userId);
      
      if (user) {
        req.user = user;
        return next();
      }
      
      // If not a user, try agent
      const agent = await Agent.findById(userId);
      if (agent) {
        req.agent = agent;
        req.user = agent; // Map agent to user for compatibility
        return next();
      }
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid token - user/agent not found'
    });
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Invalid token format'
      });
    }
    
    return res.status(403).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// ========== TOKEN GENERATORS ==========
const generateAgentToken = (agentId) => {
  return jwt.sign(
    { agentId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const generateUserToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ========== BACKWARD COMPATIBLE TOKEN GENERATOR ==========
const generateToken = (id) => {
  // Default to user token for backward compatibility
  return jwt.sign(
    { userId: id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = {
  // Authentication middleware
  authenticateAgent,
  authenticateUser,
  authenticateToken, // Backward compatible
  
  // Token generators
  generateAgentToken,
  generateUserToken,
  generateToken, // Backward compatible
};