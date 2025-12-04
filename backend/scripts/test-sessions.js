const { pool } = require('../config/database');

async function testWaitingSessions() {
  try {
    console.log('🧪 Testing waiting sessions query...');
    
    // Test the exact query from agents.js
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
         CASE 
           WHEN s.ai_mode = FALSE AND s.escalated_at IS NOT NULL THEN 1
           ELSE 2
         END,
         COALESCE(s.escalated_at, s.started_at) ASC
       LIMIT 50`
    );
    
    console.log(`📊 Found ${sessions.length} sessions total`);
    
    sessions.forEach(session => {
      console.log(`  - ${session.session_id}`);
      console.log(`    ai_mode: ${session.ai_mode}`);
      console.log(`    status: ${session.status}`);
      console.log(`    escalated_at: ${session.escalated_at}`);
      console.log(`    assigned_agent_id: ${session.assigned_agent_id}`);
      console.log(`    business_name: ${session.business_name}`);
    });
    
    // Also test active sessions for a specific agent
    const agentId = 1;
    const [activeSessions] = await pool.execute(
      `SELECT s.*, w.business_name 
       FROM sessions s
       JOIN widget_configs w ON s.site_key = w.site_key
       WHERE s.assigned_agent_id = ? AND s.status = 'active'
       ORDER BY s.started_at DESC`,
      [agentId]
    );
    
    console.log(`\n📊 Active sessions for agent ${agentId}: ${activeSessions.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testWaitingSessions();