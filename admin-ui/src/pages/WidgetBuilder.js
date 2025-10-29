import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import ColorPicker from '../components/ColorPicker';
import WidgetPreview from '../components/WidgetPreview';
import { generateSiteKey } from '../utils/helpers';

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

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: widgetConfig
  });

  const watchedValues = watch();

  useEffect(() => {
    if (isEditing) {
      fetchWidgetConfig();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps  
  }, [siteKey, isEditing]);

  useEffect(() => {
    // Update widget config when form values change
    setWidgetConfig(prev => ({ ...prev, ...watchedValues }));
  }, [watchedValues]);

  const fetchWidgetConfig = async () => {
    try {
      // Mock API call - replace with actual API
      const mockConfig = {
        businessName: 'Sample Business',
        widgetTitle: 'Chat Support',
        welcomeMessage: 'Welcome! How can we assist you?',
        primaryColor: '#007bff',
        secondaryColor: '#6c757d',
        position: 'bottom-right',
        enablePrechatForm: false,
        prechatFields: []
      };
      
      setWidgetConfig(mockConfig);
      Object.keys(mockConfig).forEach(key => {
        setValue(key, mockConfig[key]);
      });
    } catch (error) {
      toast.error('Failed to load widget configuration');
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        siteKey: isEditing ? siteKey : generateSiteKey()
      };

      // Mock API call - replace with actual API
      console.log('Saving widget config:', payload);
      
      toast.success(isEditing ? 'Widget updated successfully!' : 'Widget created successfully!');
      navigate('/widgets');
    } catch (error) {
      toast.error('Failed to save widget configuration');
    }
  };

  const positions = [
    { value: 'bottom-right', label: 'Bottom Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'top-left', label: 'Top Left' }
  ];

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
              <button type="submit" className="btn-primary">
                {isEditing ? 'Update Widget' : 'Create Widget'}
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
          <WidgetPreview config={widgetConfig} />
        </div>
      </div>
    </div>
  );
};

export default WidgetBuilder;