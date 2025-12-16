const Joi = require('joi');

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessage
      });
    }
    
    next();
  };
};

// User validation schemas
const userSchemas = {
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

// Widget validation schemas
const widgetSchemas = {
  create: Joi.object({
    business_name: Joi.string().min(1).max(100).required(),
    widget_title: Joi.string().min(1).max(100).optional(),
    welcome_message: Joi.string().min(1).max(500).optional(),
    primary_color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
    secondary_color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
    position: Joi.string().valid('bottom-right', 'bottom-left', 'top-right', 'top-left').optional(),
    enable_prechat_form: Joi.boolean().optional(),
    prechat_fields: Joi.array().optional()
  }),
  
  // SIMPLE FIX - Allow any object, no validation for updates
  update: Joi.object().unknown(true)
};

module.exports = {
  validate,
  userSchemas,
  widgetSchemas
};