const express = require('express');
const router = express.Router();
const Widget = require('../models/Widget');
const { authenticateToken } = require('../middleware/auth');
const { validate, widgetSchemas } = require('../middleware/validation');

// Apply authentication to all routes
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

// Update widget
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
    
    const updatedWidget = await widget.update(req.body);
    
    res.json({
      success: true,
      message: 'Widget updated successfully',
      data: { widget: updatedWidget }
    });
  } catch (error) {
    console.error('Update widget error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update widget'
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
    
    // Mock additional stats (will be replaced with real data from chat logs)
    const mockStats = {
      ...stats,
      total_chats: 1247,
      total_messages: 8934,
      average_response_time: '2.3 min',
      customer_satisfaction: 4.2
    };
    
    res.json({
      success: true,
      data: { stats: mockStats }
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