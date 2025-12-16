const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateAgent } = require('../middleware/auth');

// Get agent statistics
router.get('/stats', authenticateAgent, async (req, res) => {
  try {
    const agentId = req.agent.id;
    
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
      avgResponseTime: '2.3 min',
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
router.get('/active-chats', authenticateAgent, async (req, res) => {
  try {
    const agentId = req.agent.id;
    
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

// Get waiting sessions for agent queue - FIXED QUERY
// Fix the query ordering - replace the ORDER BY clause
router.get('/waiting-sessions', authenticateAgent, async (req, res) => {
  try {
    console.log('📊 Fetching waiting sessions for agent:', req.agent.id);
    
    // FIXED QUERY: Order by most recent first (DESC)
    const [sessions] = await pool.execute(
      `SELECT 
        s.session_id, 
        s.site_key, 
        s.visitor_name, 
        s.started_at, 
        s.escalated_at,
        s.ai_mode,
        s.status,
        s.assigned_agent_id,
        w.business_name 
       FROM sessions s
       LEFT JOIN widget_configs w ON s.site_key = w.site_key
       WHERE s.status = 'waiting' 
         AND (s.assigned_agent_id IS NULL OR s.assigned_agent_id = '')
       ORDER BY 
         COALESCE(s.escalated_at, s.started_at) DESC,  -- Most recent first
         s.started_at DESC
       LIMIT 50`,
      []
    );

    console.log(`📊 Found ${sessions.length} total waiting sessions in database`);
    
    // Log session details for debugging
    sessions.forEach((session, index) => {
      console.log(`  ${index + 1}. ${session.session_id}: created=${session.started_at}, escalated=${session.escalated_at}`);
    });

    const waitingSessions = sessions.map(session => ({
      sessionId: session.session_id,
      siteKey: session.site_key,
      businessName: session.business_name || 'Business',
      visitorName: session.visitor_name || 'Customer',
      waitingTime: session.escalated_at 
        ? Math.floor((new Date() - new Date(session.escalated_at)) / 60000)
        : Math.floor((new Date() - new Date(session.started_at)) / 60000),
      escalated: session.ai_mode === 0, // false means escalated to human
      addedAt: session.started_at
    }));

    console.log(`✅ Returning ${waitingSessions.length} waiting sessions to frontend`);
    
    res.json({
      success: true,
      sessions: waitingSessions
    });
  } catch (error) {
    console.error('❌ Waiting sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch waiting sessions: ' + error.message
    });
  }
});

module.exports = router;