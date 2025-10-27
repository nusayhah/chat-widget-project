import apiService from './api';

class WidgetService {
  // Get all widgets
  async getWidgets(page = 1, limit = 50) {
    try {
      const response = await apiService.get(`/widgets?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch widgets');
    }
  }

  // Get single widget by site key
  async getWidget(siteKey) {
    try {
      const response = await apiService.get(`/widgets/${siteKey}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch widget');
    }
  }

  // Create new widget
  async createWidget(widgetData) {
    try {
      const response = await apiService.post('/widgets', widgetData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create widget');
    }
  }

  // Update widget
  async updateWidget(siteKey, widgetData) {
    try {
      const response = await apiService.put(`/widgets/${siteKey}`, widgetData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update widget');
    }
  }

  // Delete widget
  async deleteWidget(siteKey) {
    try {
      const response = await apiService.delete(`/widgets/${siteKey}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete widget');
    }
  }

  // Get widget statistics
  async getWidgetStats() {
    try {
      const response = await apiService.get('/widgets/stats/overview');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch statistics');
    }
  }

  // Generate embed code for widget
  generateEmbedCode(siteKey, cdnUrl = 'https://your-domain.com') {
    return `<script defer src="${cdnUrl}/widget.js" data-site-key="${siteKey}"></script>`;
  }
}

export default new WidgetService();