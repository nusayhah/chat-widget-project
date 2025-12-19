const express = require('express');
const router = express.Router();

// 🐛 DEBUG: Add this right after router creation
router.use((req, res, next) => {
  console.log(`🔍 [WIDGETS ROUTE] ${req.method} ${req.originalUrl}`);
  next();
});

const Widget = require('../models/Widget');
const { authenticateToken } = require('../middleware/auth');
const { validate, widgetSchemas } = require('../middleware/validation');
const Session = require('../models/Session');
const agentQueue = require('../utils/agentQueue');

// 🆕 ADD MESSAGE MODEL IMPORT
const Message = require('../models/Message');

// Escalation routes (public - called by widget)
// POST /api/widgets/escalate/:siteKey/:sessionId
router.post('/escalate/:siteKey/:sessionId', async (req, res) => {
  try {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    const { siteKey, sessionId } = req.params;
    
    console.log(`🚨 ESCALATION REQUEST - Site: ${siteKey}, Session: ${sessionId}`);
    
    // Find the session first
    const session = await Session.findBySessionId(sessionId);
    
    if (!session) {
      console.log(`❌ Session not found in database: ${sessionId}`);
      return res.status(404).json({
        success: false,
        message: 'Session not found - please send a message first'
      });
    }

    console.log(`✅ Session found, escalating: ${sessionId}`);
    
    // Update session to escalate
    await Session.escalateToHuman(sessionId);
    
    // 🆕 FIX: USE AWAIT WITH NEW DATABASE QUEUE
    let queuePosition = await agentQueue.getQueuePosition(sessionId);
    console.log(`🔍 Existing queue position: ${queuePosition}`);
    
    if (queuePosition && queuePosition > 0) {
      // 🆕 RE-ESCALATION: Use existing position
      console.log(`🔄 Re-escalation detected, using existing position: ${queuePosition}`);
    } else {
      // 🆕 FIRST-TIME ESCALATION: Add to queue and get new position
      queuePosition = await agentQueue.addToQueue(sessionId, siteKey);
      console.log(`🆕 First escalation, new position: ${queuePosition}`);
    }
    
    // 🆕 FALLBACK: Ensure queuePosition is never null/undefined
    if (!queuePosition || queuePosition < 1) {
      console.warn(`⚠️ Invalid queue position (${queuePosition}), using fallback`);
      queuePosition = 1;
    }
    
    const estimatedWait = queuePosition * 2;
    
    console.log(`✅ Escalation successful. Queue position: ${queuePosition}, Wait: ${estimatedWait}min`);
    
    res.json({
      success: true,
      message: 'Chat escalated to human agent',
      data: { 
        sessionId,
        queuePosition: queuePosition,
        estimatedWait: estimatedWait
      }
    });
  } catch (error) {
    console.error('❌ Escalation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to escalate chat: ' + error.message
    });
  }
});

// 🆕 ADD THIS ENDPOINT FOR FETCHING CHAT HISTORY
router.get('/sessions/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log(`📨 Fetching messages for session: ${sessionId}`);
    
    const session = await Session.findBySessionId(sessionId);
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    // 🆕 FETCH MESSAGES FROM DATABASE
    let messages = [];
    try {
      // Try to fetch from database first
      messages = await Message.findBySessionId(sessionId);
    } catch (error) {
      console.log('No messages found in database, using empty array');
      messages = [];
    }

    // 🆕 FORMAT MESSAGES FOR FRONTEND
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      text: msg.message,
      sender: msg.sender_type === 'agent' ? 'agent' : 'customer',
      timestamp: new Date(msg.created_at),
      isAI: msg.sender_type === 'ai'
    }));

    // 🆕 GET CUSTOMER INFO
    const customerInfo = {
      name: session.visitor_name || 'Customer',
      email: session.visitor_email || '',
      business: session.business_name || 'Business',
      waitingTime: session.escalated_at 
        ? Math.floor((new Date() - new Date(session.escalated_at)) / 60000) + ' minutes'
        : '0 minutes'
    };

    res.json({
      success: true,
      messages: formattedMessages,
      customerInfo: customerInfo
    });
  } catch (error) {
    console.error('❌ Failed to fetch messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history'
    });
  }
});

// Get queue position
router.get('/queue-position/:siteKey/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const position = await agentQueue.getQueuePosition(sessionId);
    
    res.json({
      success: true,
      data: { 
        position,
        estimatedWait: position ? position * 2 : null
      }
    });
  } catch (error) {
    console.error('Queue position error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get queue position'
    });
  }
});

// Get queue stats (for admin/agent UI)
router.get('/:siteKey/queue-stats', async (req, res) => {
  try {
    const stats = await agentQueue.getQueueStats();
    
    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Queue stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get queue stats'
    });
  }
});

// Get widget config by site key (public route for widget)
router.get('/:siteKey/config', async (req, res) => {
  try {
    const { siteKey } = req.params;
    console.log('Fetching config for site key:', siteKey);
    
    const widget = await Widget.findBySiteKey(siteKey);
    
    if (!widget) {
      console.log('Widget not found for site key:', siteKey);
      return res.status(404).json({
        success: false,
        message: 'Widget not found for site key: ' + siteKey
      });
    }
    
    res.json({
      businessName: widget.business_name,
      widgetTitle: widget.widget_title,
      welcomeMessage: widget.welcome_message,
      primaryColor: widget.primary_color,
      secondaryColor: widget.secondary_color,
      position: widget.position,
      enablePrechatForm: widget.enable_prechat_form,
      prechatFields: widget.prechat_fields
    });
  } catch (error) {
    console.error('Get widget config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch widget config: ' + error.message
    });
  }
});

// 🧪 SUPER SIMPLE TEST
router.post('/simple-test', (req, res) => {
  console.log('✅ SIMPLE TEST ROUTE WORKING!');
  res.json({ success: true, message: 'Simple test works!' });
});

// 🧪 ADD THIS MISSING TEST ROUTE
// In your widgets.js - FIX THE TEST ROUTE
router.post('/test-escalation-full', async (req, res) => {
  try {
    const sessionId = 'test-' + Date.now();
    const siteKey = 'demo-widget-key';
    
    console.log('🧪 Testing full escalation flow...');
    
    // 1. Create a test session first
    await Session.create({
      session_id: sessionId,
      site_key: siteKey,
      visitor_info: { test: true }
    });
    console.log('✅ Session created');
    
    // 2. Escalate the session
    await Session.escalateToHuman(sessionId);
    console.log('✅ Session escalated');
    
    // 3. Add to queue - 🆕 ADD AWAIT
    const position = await agentQueue.addToQueue(sessionId, siteKey); // 🆕 FIX
    console.log('✅ Added to queue, position:', position);
    
    res.json({
      success: true,
      message: 'Full escalation test passed!',
      data: {
        sessionId,
        queuePosition: position,
        queueStats: await agentQueue.getQueueStats() // 🆕 ADD AWAIT
      }
    });
  } catch (error) {
    console.error('🧪 Test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Test failed: ' + error.message
    });
  }
});

// 🚨 AUTHENTICATION APPLIES TO ROUTES BELOW THIS LINE ONLY
router.use(authenticateToken);

// Get all widgets for the authenticated user
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const widgets = await Widget.findByUserId(req.user.id, parseInt(limit), offset);
    const stats = await Widget.getStats(req.user.id);
    
    res.json({
      success: true,
      data: {
        widgets,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: stats.total_widgets
        }
      }
    });
  } catch (error) {
    console.error('Get widgets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch widgets'
    });
  }
});

// Get single widget by site key
router.get('/:siteKey', async (req, res) => {
  try {
    const { siteKey } = req.params;
    const widget = await Widget.findBySiteKey(siteKey);
    
    if (!widget) {
      return res.status(404).json({
        success: false,
        message: 'Widget not found'
      });
    }
    
    // Check if widget belongs to authenticated user
    if (widget.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: { widget }
    });
  } catch (error) {
    console.error('Get widget error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch widget'
    });
  }
});

// Create new widget
router.post('/', validate(widgetSchemas.create), async (req, res) => {
  try {
    const widget = await Widget.create(req.body, req.user.id);
    
    res.status(201).json({
      success: true,
      message: 'Widget created successfully',
      data: { widget }
    });
  } catch (error) {
    console.error('Create widget error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create widget'
    });
  }
});

// Update widget - FIXED VERSION
router.put('/:siteKey', validate(widgetSchemas.update), async (req, res) => {
  try {
    const { siteKey } = req.params;
    const widget = await Widget.findBySiteKey(siteKey);
    
    if (!widget) {
      return res.status(404).json({
        success: false,
        message: 'Widget not found'
      });
    }
    
    // Check if widget belongs to authenticated user
    if (widget.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // 🆕 FIX: Transform incoming data to handle both camelCase and snake_case
    const updateData = {};
    
    // Map camelCase to snake_case for compatibility
    if (req.body.businessName !== undefined) updateData.business_name = req.body.businessName;
    if (req.body.business_name !== undefined) updateData.business_name = req.body.business_name;
    
    if (req.body.widgetTitle !== undefined) updateData.widget_title = req.body.widgetTitle;
    if (req.body.widget_title !== undefined) updateData.widget_title = req.body.widget_title;
    
    if (req.body.welcomeMessage !== undefined) updateData.welcome_message = req.body.welcomeMessage;
    if (req.body.welcome_message !== undefined) updateData.welcome_message = req.body.welcome_message;
    
    if (req.body.primaryColor !== undefined) updateData.primary_color = req.body.primaryColor;
    if (req.body.primary_color !== undefined) updateData.primary_color = req.body.primary_color;
    
    if (req.body.secondaryColor !== undefined) updateData.secondary_color = req.body.secondaryColor;
    if (req.body.secondary_color !== undefined) updateData.secondary_color = req.body.secondary_color;
    
    // Direct mappings (same name in both)
    if (req.body.position !== undefined) updateData.position = req.body.position;
    if (req.body.enable_prechat_form !== undefined) updateData.enable_prechat_form = req.body.enable_prechat_form;
    if (req.body.prechat_fields !== undefined) updateData.prechat_fields = req.body.prechat_fields;
    
    // 🆕 CRITICAL FIX: Handle is_active field properly
    if (req.body.is_active !== undefined) {
      updateData.is_active = req.body.is_active;
    } else if (req.body.isActive !== undefined) {
      updateData.is_active = req.body.isActive;
    }
    
    console.log('🔧 Processing widget update with data:', updateData);
    
    const updatedWidget = await widget.update(updateData);
    
    res.json({
      success: true,
      message: 'Widget updated successfully',
      data: { widget: updatedWidget }
    });
  } catch (error) {
    console.error('Update widget error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update widget: ' + error.message
    });
  }
});

// Delete widget
router.delete('/:siteKey', async (req, res) => {
  try {
    const { siteKey } = req.params;
    const widget = await Widget.findBySiteKey(siteKey);
    
    if (!widget) {
      return res.status(404).json({
        success: false,
        message: 'Widget not found'
      });
    }
    
    // Check if widget belongs to authenticated user
    if (widget.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await widget.delete();
    
    res.json({
      success: true,
      message: 'Widget deleted successfully'
    });
  } catch (error) {
    console.error('Delete widget error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete widget'
    });
  }
});

// Get widget statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Widget.getStats(req.user.id);
    
    res.json({
      success: true,
      data: { 
        stats: stats // Already includes all data from updated method
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;