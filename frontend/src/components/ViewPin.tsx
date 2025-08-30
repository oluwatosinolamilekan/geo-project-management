'use client';

import { useState, useEffect } from 'react';
import { Pin, SidebarState } from '@/types';

interface ViewPinProps {
  pin: Pin;
  onSidebarStateChange: (state: Partial<SidebarState>) => void;
  onDeletePin: (pin: Pin) => void;
}

export default function ViewPin({ 
  pin, 
  onSidebarStateChange, 
  onDeletePin 
}: ViewPinProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const loadImage = () => {
    const randomId = Math.floor(Math.random() * 1000);
    const timestamp = Date.now();
    setImageLoading(true);
    setImageError(false);
    
    // Set timeout to handle cases where image doesn't load
    const timeoutId = setTimeout(() => {
      setImageLoading(false);
      setImageError(true);
    }, 8000); // 8 second timeout
    
    setImageUrl(`https://picsum.photos/300/200?random=${randomId}&t=${timestamp}`);
    
    // Clear timeout when component unmounts or image loads
    return timeoutId;
  };

  // Handle pin image loading
  useEffect(() => {
    const timeoutId = loadImage();
    return () => clearTimeout(timeoutId);
  }, [pin.id]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Pin #{pin.id}</h2>
          <p className="text-sm text-gray-800 font-medium">Pin Details</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              // Trigger pin edit mode in the map
              const event = new CustomEvent('startPinEdit', { detail: { pin } });
              window.dispatchEvent(event);
              onSidebarStateChange({ 
                mode: 'edit-pin', 
                data: { pin } 
              });
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDeletePin(pin)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">Project:</span>
          <span className="text-gray-800 font-medium">{pin.project?.name}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">Latitude:</span>
          <span className="text-gray-800 font-mono text-sm">{pin.latitude ? Number(pin.latitude).toFixed(6) : 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">Longitude:</span>
          <span className="text-gray-800 font-mono text-sm">{pin.longitude ? Number(pin.longitude).toFixed(6) : 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">Created:</span>
          <span className="text-gray-800 font-medium">{new Date(pin.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      
      {/* Pin Location Visualization */}
      <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border-2 border-blue-200 flex items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='m0 40l40-40h-40v40zm40 0v-40h-40l40 40z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        
        {/* Pin Icon and Info */}
        <div className="text-center z-10">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="bg-white bg-opacity-90 rounded-lg p-3 shadow-sm">
            <p className="text-sm font-semibold text-gray-800">Pin Location</p>
            <p className="text-xs text-gray-600 mt-1">
              {pin.latitude ? Number(pin.latitude).toFixed(4) : 'N/A'}°, {pin.longitude ? Number(pin.longitude).toFixed(4) : 'N/A'}°
            </p>
          </div>
        </div>
        
        {/* Optional: Show actual image if available */}
        {imageUrl && !imageLoading && !imageError && (
          <div className="absolute inset-0">
            <img 
              src={imageUrl} 
              alt="Pin location" 
              className="w-full h-full object-cover rounded-lg opacity-30"
              onLoad={() => {
                setImageLoading(false);
                setImageError(false);
              }}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
          </div>
        )}
        
        {/* Loading state */}
        {imageLoading && (
          <div className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
      
      <button
        onClick={() => onSidebarStateChange({ 
          mode: 'view-project', 
          data: { project: pin.project } 
        })}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Project</span>
      </button>
    </div>
  );
}
