const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ApiService {
  static async getActiveChats() {
    const response = await fetch(`${API_URL}/agents/active-chats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch active chats');
    }
    
    const data = await response.json();
    return data.data || [];
  }
}

export default ApiService;