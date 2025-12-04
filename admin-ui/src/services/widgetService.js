import apiService from './api';

class WidgetService {
  // Get all widgets for authenticated user - REAL API CALL
  async getWidgets(page = 1, limit = 50) {
    try {
      const response = await apiService.get(`/widgets?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Get widgets API error:', error);
      throw new Error(error.message || 'Failed to fetch widgets');
    }
  }

  // Get single widget by site key - REAL API CALL
  async getWidget(siteKey) {
    try {
      const response = await apiService.get(`/widgets/${siteKey}`);
      return response;
    } catch (error) {
      console.error('Get widget API error:', error);
      throw new Error(error.message || 'Failed to fetch widget');
    }
  }

  // Create new widget - REAL API CALL
  async createWidget(widgetData) {
    try {
      // Transform frontend data to match backend schema
      const backendData = {
        business_name: widgetData.businessName,
        widget_title: widgetData.widgetTitle,
        welcome_message: widgetData.welcomeMessage,
        primary_color: widgetData.primaryColor,
        secondary_color: widgetData.secondaryColor,
        position: widgetData.position,
        enable_prechat_form: widgetData.enablePrechatForm,
        prechat_fields: widgetData.prechatFields || []
      };

      const response = await apiService.post('/widgets', backendData);
      return response;
    } catch (error) {
      console.error('Create widget API error:', error);
      throw new Error(error.message || 'Failed to create widget');
    }
  }

  // Update widget - REAL API CALL
  async updateWidget(siteKey, widgetData) {
    try {
      // Transform frontend data to match backend schema
      const backendData = {
        business_name: widgetData.businessName,
        widget_title: widgetData.widgetTitle,
        welcome_message: widgetData.welcomeMessage,
        primary_color: widgetData.primaryColor,
        secondary_color: widgetData.secondaryColor,
        position: widgetData.position,
        enable_prechat_form: widgetData.enablePrechatForm,
        prechat_fields: widgetData.prechatFields || []
      };

      const response = await apiService.put(`/widgets/${siteKey}`, backendData);
      return response;
    } catch (error) {
      console.error('Update widget API error:', error);
      throw new Error(error.message || 'Failed to update widget');
    }
  }

  // Delete widget - REAL API CALL
  async deleteWidget(siteKey) {
    try {
      const response = await apiService.delete(`/widgets/${siteKey}`);
      return response;
    } catch (error) {
      console.error('Delete widget API error:', error);
      throw new Error(error.message || 'Failed to delete widget');
    }
  }

  // Get widget statistics - REAL API CALL
  async getWidgetStats() {
    try {
      const response = await apiService.get('/widgets/stats/overview');
      return response;
    } catch (error) {
      console.error('Get widget stats API error:', error);
      throw new Error(error.message || 'Failed to fetch statistics');
    }
  }

  // Generate embed code for widget - NEW FEATURE
  generateEmbedCode(siteKey, cdnUrl = process.env.REACT_APP_CDN_URL) {
  const finalCdnUrl = cdnUrl || 'https://your-domain.com'; // Generic fallback
  return `<script defer src="${finalCdnUrl}/widget.js" data-site-key="${siteKey}"></script>`;
  }
}

const widgetService = new WidgetService();
export default widgetService;