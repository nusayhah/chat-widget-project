import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import ColorPicker from '../components/ColorPicker';
import WidgetPreview from '../components/WidgetPreview';
import widgetService from '../services/widgetService';
import { generateEmbedCode, copyToClipboard, getWidgetInstallationInstructions } from '../utils/helpers';

const WidgetBuilder = () => {
  const { siteKey } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(siteKey);
  
  const [widgetConfig, setWidgetConfig] = useState({
    businessName: '',
    widgetTitle: 'Chat with us',
    welcomeMessage: 'Hello! How can we help you today?',
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    position: 'bottom-right',
    enablePrechatForm: false,
    prechatFields: []
  });

  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: widgetConfig
  });

  const watchedValues = watch();

  useEffect(() => {
    if (isEditing) {
      fetchWidgetConfig();
    }
  }, [siteKey, isEditing]);

  useEffect(() => {
    // Update widget config when form values change
    setWidgetConfig(prev => ({ ...prev, ...watchedValues }));
  }, [watchedValues]);

  const fetchWidgetConfig = async () => {
    try {
      setLoading(true);
      const response = await widgetService.getWidget(siteKey);
      
      if (response.success) {
        const widget = response.data.widget;
        
        // Transform backend data to frontend format
        const frontendConfig = {
          businessName: widget.business_name,
          widgetTitle: widget.widget_title,
          welcomeMessage: widget.welcome_message,
          primaryColor: widget.primary_color,
          secondaryColor: widget.secondary_color,
          position: widget.position,
          enablePrechatForm: widget.enable_prechat_form,
          prechatFields: widget.prechat_fields || []
        };
        
        setWidgetConfig(frontendConfig);
        Object.keys(frontendConfig).forEach(key => {
          setValue(key, frontendConfig[key]);
        });
      } else {
        throw new Error(response.message || 'Failed to load widget');
      }
    } catch (error) {
      console.error('Error fetching widget:', error);
      toast.error('Failed to load widget configuration');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      let response;
      
      if (isEditing) {
        // Update existing widget
        response = await widgetService.updateWidget(siteKey, data);
        
        if (response.success) {
          toast.success('Widget updated successfully!');
          navigate('/widgets');
        } else {
          throw new Error(response.message || 'Update failed');
        }
      } else {
        // Create new widget and redirect immediately
        response = await widgetService.createWidget(data);
        
        if (response.success) {
          toast.success('Widget created successfully!');
          navigate('/widgets'); // Redirect to widgets list
        } else {
          throw new Error(response.message || 'Creation failed');
        }
      }
    } catch (error) {
      console.error('Error saving widget:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} widget`);
    } finally {
      setLoading(false);
    }
  };

  const positions = [
    { value: 'bottom-right', label: 'Bottom Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'top-left', label: 'Top Left' }
  ];

  if (loading && isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Edit Widget' : 'Create New Widget'}
        </h1>
        <p className="mt-2 text-gray-600">
          Customize your chat widget appearance and behavior
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Form */}
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    {...register('businessName', { required: 'Business name is required' })}
                    className="input-field"
                    placeholder="Enter your business name"
                  />
                  {errors.businessName && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Widget Title
                  </label>
                  <input
                    type="text"
                    {...register('widgetTitle')}
                    className="input-field"
                    placeholder="Chat with us"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Welcome Message
                  </label>
                  <textarea
                    {...register('welcomeMessage')}
                    rows={3}
                    className="input-field"
                    placeholder="Hello! How can we help you today?"
                  />
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Appearance</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Color
                  </label>
                  <ColorPicker
                    color={watchedValues.primaryColor}
                    onChange={(color) => setValue('primaryColor', color)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secondary Color
                  </label>
                  <ColorPicker
                    color={watchedValues.secondaryColor}
                    onChange={(color) => setValue('secondaryColor', color)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <select {...register('position')} className="input-field">
                    {positions.map((pos) => (
                      <option key={pos.value} value={pos.value}>
                        {pos.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Pre-chat Form */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pre-chat Form</h3>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('enablePrechatForm')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Enable pre-chat form to collect visitor information
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/widgets')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (
                  isEditing ? 'Update Widget' : 'Create Widget'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Live Preview</h3>
          <WidgetPreview config={widgetConfig} />
        </div>
      </div>
    </div>
  );
};

export default WidgetBuilder;