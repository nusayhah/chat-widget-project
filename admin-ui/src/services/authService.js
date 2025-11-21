import apiService from './api';

class AuthService {
  // Register new user
  async register(userData) {
    try {
      const response = await apiService.post('/auth/register', userData);
      
      if (response.success && response.data.token) {
        apiService.setAuthToken(response.data.token);
      }
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await apiService.post('/auth/login', credentials);
      
      if (response.success && response.data.token) {
        apiService.setAuthToken(response.data.token);
      }
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  // Logout user
  logout() {
    apiService.removeAuthToken();
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await apiService.get('/auth/me');
      return response;
    } catch (error) {
      // If token is invalid, remove it
      if (error.message.includes('token') || error.message.includes('401')) {
        this.logout();
      }
      throw new Error(error.message || 'Failed to get user profile');
    }
  }

  // Check if user is logged in
  isAuthenticated() {
    return !!apiService.getAuthToken();
  }
}

const authService = new AuthService();
export default authService;