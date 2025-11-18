class AgentQueue {
  constructor() {
    this.queue = new Map(); // sessionId -> session data
    this.availableAgents = new Set(); // agentIds that are available
  }

  // Add session to queue
  addToQueue(sessionId, siteKey) {
    this.queue.set(sessionId, {
      sessionId,
      siteKey,
      addedAt: new Date(),
      position: this.queue.size + 1
    });
    console.log(`Session ${sessionId} added to queue. Position: ${this.queue.size}`);
    this.assignAgentsToQueue();
  }

  // Remove session from queue (when assigned or cancelled)
  removeFromQueue(sessionId) {
    this.queue.delete(sessionId);
    console.log(`Session ${sessionId} removed from queue`);
    this.updateQueuePositions();
  }

  // Get queue position for a session
  getQueuePosition(sessionId) {
    if (!this.queue.has(sessionId)) {
      return null; // Not in queue or already assigned
    }
    
    const queueArray = Array.from(this.queue.values())
      .sort((a, b) => a.addedAt - b.addedAt);
    
    return queueArray.findIndex(item => item.sessionId === sessionId) + 1;
  }

  // Update all queue positions
  updateQueuePositions() {
    const queueArray = Array.from(this.queue.values())
      .sort((a, b) => a.addedAt - b.addedAt);
    
    queueArray.forEach((item, index) => {
      item.position = index + 1;
    });
  }

  // Add agent to available pool
  addAvailableAgent(agentId) {
    this.availableAgents.add(agentId);
    console.log(`Agent ${agentId} is now available`);
    this.assignAgentsToQueue();
  }

  // Remove agent from available pool
  removeAvailableAgent(agentId) {
    this.availableAgents.delete(agentId);
    console.log(`Agent ${agentId} is no longer available`);
  }

  // Assign available agents to waiting sessions
  assignAgentsToQueue() {
    if (this.availableAgents.size === 0 || this.queue.size === 0) {
      return;
    }

    const availableAgent = Array.from(this.availableAgents)[0];
    const nextSession = Array.from(this.queue.values())
      .sort((a, b) => a.addedAt - b.addedAt)[0];

    if (nextSession && availableAgent) {
      // In a real system, this would call your Session model to assign agent
      console.log(`Assigning agent ${availableAgent} to session ${nextSession.sessionId}`);
      
      // Remove from queue and available agents temporarily
      this.removeFromQueue(nextSession.sessionId);
      this.removeAvailableAgent(availableAgent);
      
      // Return assignment info (will be used by WebSocket)
      return {
        agentId: availableAgent,
        sessionId: nextSession.sessionId
      };
    }
  }

  // Get queue stats
  getQueueStats() {
    return {
      waitingSessions: this.queue.size,
      availableAgents: this.availableAgents.size,
      queue: Array.from(this.queue.values()).map(item => ({
        sessionId: item.sessionId,
        position: item.position,
        waitingTime: Math.floor((new Date() - item.addedAt) / 1000) // seconds
      }))
    };
  }
}

// Create singleton instance
const agentQueue = new AgentQueue();
module.exports = agentQueue;