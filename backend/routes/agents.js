const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get agent statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const agentId = req.user.id;
    
    console.log('📊 Fetching stats for agent:', agentId);
    
    // Get total chats handled by this agent
    const [chatsResult] = await pool.execute(
      `SELECT COUNT(*) as chats_handled 
       FROM sessions 
       WHERE assigned_agent_id = ?`,
      [agentId]
    );
    
    // Get active chats count
    const [activeChatsResult] = await pool.execute(
      `SELECT COUNT(*) as active_chats
       FROM sessions 
       WHERE assigned_agent_id = ? AND status = 'active'`,
      [agentId]
    );
    
    const stats = {
      chatsHandled: chatsResult[0]?.chats_handled || 0,
      activeChats: activeChatsResult[0]?.active_chats || 0,
      avgResponseTime: '2.3 min', // Will implement real calculation later
      customerSatisfaction: 4.2
    };
    
    console.log('📊 Stats result:', stats);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Agent stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent statistics: ' + error.message
    });
  }
});

// Get active chats for agent
router.get('/active-chats', authenticateToken, async (req, res) => {
  try {
    const agentId = req.user.id;
    
    const [sessions] = await pool.execute(
      `SELECT s.*, w.business_name 
       FROM sessions s
       JOIN widget_configs w ON s.site_key = w.site_key
       WHERE s.assigned_agent_id = ? AND s.status = 'active'
       ORDER BY s.started_at DESC`,
      [agentId]
    );

    // Get message count for each session
    const sessionsWithStats = await Promise.all(
      sessions.map(async (session) => {
        const [messageCount] = await pool.execute(
          'SELECT COUNT(*) as count FROM messages WHERE session_id = ?',
          [session.session_id]
        );
        
        return {
          ...session,
          messageCount: messageCount[0].count,
          visitor_info: JSON.parse(session.visitor_info || '{}')
        };
      })
    );

    res.json({
      success: true,
      data: sessionsWithStats
    });
  } catch (error) {
    console.error('Active chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active chats'
    });
  }
});

// Get waiting sessions for agent queue
router.get('/waiting-sessions', authenticateToken, async (req, res) => {
  try {
    const [sessions] = await pool.execute(
      `SELECT s.*, w.business_name 
       FROM sessions s
       JOIN widget_configs w ON s.site_key = w.site_key
       WHERE s.status = 'waiting' AND s.ai_mode = FALSE
       ORDER BY s.escalated_at ASC`,
      []
    );

    const waitingSessions = sessions.map(session => ({
      sessionId: session.session_id,
      siteKey: session.site_key,
      businessName: session.business_name,
      visitorName: session.visitor_name || 'Customer',
      waitingTime: Math.floor((new Date() - new Date(session.escalated_at || session.started_at)) / 60000),
      addedAt: session.started_at
    }));

    res.json({
      success: true,
      sessions: waitingSessions
    });
  } catch (error) {
    console.error('Waiting sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch waiting sessions'
    });
  }
});

module.exports = router;