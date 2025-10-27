import React, { useState } from 'react';
import { ChromePicker } from 'react-color';

const ColorPicker = ({ color, onChange }) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleColorChange = (colorResult) => {
    onChange(colorResult.hex);
  };

  return (
    <div className="relative">
      <div
        className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer flex items-center px-3"
        onClick={() => setShowPicker(!showPicker)}
      >
        <div
          className="w-6 h-6 rounded border border-gray-300 mr-3"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm text-gray-700">{color}</span>
      </div>
      
      {showPicker && (
        <div className="absolute top-12 left-0 z-10">
          <div
            className="fixed inset-0"
            onClick={() => setShowPicker(false)}
          />
          <ChromePicker
            color={color}
            onChange={handleColorChange}
            disableAlpha
          />
        </div>
      )}
    </div>
  );
};

export default ColorPicker;