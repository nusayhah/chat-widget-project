const express = require('express');
const router = express.Router();

// Mock widget configurations - in production, this would come from database
const widgetConfigs = {
  'demo-site-key': {
    businessName: 'Demo Support Team',
    widgetTitle: 'Chat with us',
    welcomeMessage: 'Hello! How can we help you today?',
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    position: 'bottom-right',
    enablePrechatForm: false,
    prechatFields: []
  }
};

// Get widget configuration by site key
router.get('/:siteKey/config', (req, res) => {
  const { siteKey } = req.params;
  
  const config = widgetConfigs[siteKey];
  if (!config) {
    return res.status(404).json({ error: 'Widget configuration not found' });
  }
  
  res.json(config);
});

// Update widget configuration
router.put('/:siteKey/config', (req, res) => {
  const { siteKey } = req.params;
  const config = req.body;
  
  widgetConfigs[siteKey] = { ...widgetConfigs[siteKey], ...config };
  
  res.json({ message: 'Widget configuration updated successfully', config: widgetConfigs[siteKey] });
});

// Create new widget configuration
router.post('/config', (req, res) => {
  const { siteKey, ...config } = req.body;
  
  if (!siteKey) {
    return res.status(400).json({ error: 'Site key is required' });
  }
  
  widgetConfigs[siteKey] = config;
  
  res.status(201).json({ message: 'Widget configuration created successfully', siteKey, config });
});

module.exports = router;