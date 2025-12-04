import apiService from './api';

class AuthService {
  // Register new user - REAL API CALL
  async register(userData) {
    try {
      const response = await apiService.post('/auth/register', userData);
      
      if (response.success) {
        // Store the real JWT token
        apiService.setAuthToken(response.data.token);
        return response;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration API error:', error);
      throw new Error(error.message || 'Failed to register user');
    }
  }

  // Login user - REAL API CALL
  async login(credentials) {
    try {
      const response = await apiService.post('/auth/login', credentials);
      
      if (response.success) {
        // Store the real JWT token
        apiService.setAuthToken(response.data.token);
        return response;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login API error:', error);
      throw new Error(error.message || 'Failed to login');
    }
  }

  // Logout user
  logout() {
    apiService.removeAuthToken();
  }

  // Get current user profile - REAL API CALL
  async getCurrentUser() {
    try {
      const response = await apiService.get('/auth/me');
      
      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || 'Failed to get user profile');
      }
    } catch (error) {
      console.error('Get current user API error:', error);
      throw new Error(error.message || 'Failed to fetch user profile');
    }
  }

  // Check if user is logged in
  isAuthenticated() {
    return !!apiService.getAuthToken();
  }
}

const authService = new AuthService();
export default authService;