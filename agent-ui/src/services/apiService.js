const API_URL = process.env.REACT_APP_API_URL || 'https://192.168.100.124/api';

class ApiService {
  static async getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  static async handleResponse(response) {
    if (response.status === 401) {
      // Token expired or invalid
      console.error('❌ Authentication expired');
      localStorage.removeItem('token');
      localStorage.removeItem('agent');
      window.location.href = '/agent/login';
      throw new Error('Authentication expired. Please login again.');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error ${response.status}:`, errorText);
      throw new Error(`API request failed: ${response.status}`);
    }
    
    return response.json();
  }

  static async getActiveChats() {
    try {
      console.log('📡 Fetching active chats...');
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_URL}/agents/active-chats`, {
        headers
      });
      
      const data = await this.handleResponse(response);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch active chats');
      }
      
      console.log(`✅ Active chats fetched: ${data.data?.length || 0} chats`);
      return data.data || [];
    } catch (error) {
      console.error('❌ Failed to fetch active chats:', error.message);
      throw error;
    }
  }

  static async getWaitingSessions() {
    try {
      console.log('📡 Fetching waiting sessions...');
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_URL}/agents/waiting-sessions`, {
        headers
      });
      
      const data = await this.handleResponse(response);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch waiting sessions');
      }
      
      console.log(`✅ Waiting sessions fetched: ${data.sessions?.length || 0} sessions`);
      return data.sessions || [];
    } catch (error) {
      console.error('❌ Failed to fetch waiting sessions:', error);
      throw error;
    }
  }

  static async getAgentStats() {
    try {
      console.log('📡 Fetching agent stats...');
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_URL}/agents/stats`, {
        headers
      });
      
      const data = await this.handleResponse(response);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch agent stats');
      }
      
      console.log('✅ Agent stats fetched:', data.data);
      return data.data || {};
    } catch (error) {
      console.error('❌ Failed to fetch agent stats:', error);
      throw error;
    }
  }
}

export default ApiService;