/**
 * Generate a unique site key for widget identification
 */
export const generateSiteKey = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `widget-${timestamp}-${randomStr}`;
};

/**
 * Validate hex color format
 */
export const isValidHexColor = (color) => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Generate embed code for widget
 */
export const generateEmbedCode = (siteKey, cdnUrl = process.env.REACT_APP_CDN_URL || 'https://your-domain.com') => {
  return `<script defer src="${cdnUrl}/widget.js" data-site-key="${siteKey}"></script>`;
};

/**
 * Validate widget configuration
 */
export const validateWidgetConfig = (config) => {
  const errors = {};

  if (!config.businessName?.trim()) {
    errors.businessName = 'Business name is required';
  }

  if (!config.widgetTitle?.trim()) {
    errors.widgetTitle = 'Widget title is required';
  }

  if (!config.welcomeMessage?.trim()) {
    errors.welcomeMessage = 'Welcome message is required';
  }

  if (!isValidHexColor(config.primaryColor)) {
    errors.primaryColor = 'Invalid primary color format';
  }

  if (!isValidHexColor(config.secondaryColor)) {
    errors.secondaryColor = 'Invalid secondary color format';
  }

  const validPositions = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
  if (!validPositions.includes(config.position)) {
    errors.position = 'Invalid widget position';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (err) {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
};

/**
 * Debounce function for search and input handling
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Calculate color contrast ratio for accessibility
 */
export const getContrastRatio = (color1, color2) => {
  const getLuminance = (color) => {
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if color combination meets WCAG accessibility standards
 */
export const isAccessibleColorCombination = (foreground, background) => {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= 4.5; // WCAG AA standard for normal text
};

/**
 * Get widget installation instructions
 */
export const getWidgetInstallationInstructions = (siteKey) => {
  const embedCode = generateEmbedCode(siteKey);
  
  return {
    steps: [
      'Copy the embed code below',
      'Paste it just before the closing </body> tag on your website',
      'The chat widget will automatically appear on your site',
      'Customize the widget appearance in your dashboard anytime'
    ],
    embedCode: embedCode,
    example: `<!-- Place this in your website's HTML -->
<!DOCTYPE html>
<html>
<head>
  <title>Your Website</title>
</head>
<body>
  <!-- Your website content -->
  
  ${embedCode}
</body>
</html>`,
    notes: [
      'The widget will load asynchronously and not block your page',
      'It will automatically connect to your chat server',
      'Visitors can start chatting immediately',
      'You can manage all chats from your admin dashboard'
    ]
  };
};

/**
 * Format number with commas for display
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num);
};

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(dateString);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Generate random ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};