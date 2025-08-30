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

  // Handle pin image loading
  useEffect(() => {
    // Generate a random image URL for each pin view
    const randomId = Math.floor(Math.random() * 1000);
    const timestamp = Date.now();
    setImageLoading(true);
    setImageError(false);
    setImageUrl(`https://picsum.photos/300/200?random=${randomId}&t=${timestamp}`);
  }, [pin.id]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold">Pin #{pin.id}</h2>
          <p className="text-sm text-gray-500">Pin Details</p>
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
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDeletePin(pin)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <p><strong>Project:</strong> {pin.project?.name}</p>
        <p><strong>Latitude:</strong> {pin.latitude ? Number(pin.latitude).toFixed(6) : 'N/A'}</p>
        <p><strong>Longitude:</strong> {pin.longitude ? Number(pin.longitude).toFixed(6) : 'N/A'}</p>
        <p><strong>Created:</strong> {new Date(pin.created_at).toLocaleDateString()}</p>
      </div>
      
      <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center">
        {imageLoading && (
          <div className="text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm">Loading image...</p>
          </div>
        )}
        {imageError && (
          <div className="text-gray-500 text-center">
            <p className="text-sm">Failed to load image</p>
            <button 
              onClick={() => {
                const randomId = Math.floor(Math.random() * 1000);
                const timestamp = Date.now();
                setImageLoading(true);
                setImageError(false);
                setImageUrl(`https://picsum.photos/300/200?random=${randomId}&t=${timestamp}`);
              }}
              className="text-blue-500 hover:text-blue-700 text-sm mt-1"
            >
              Retry
            </button>
          </div>
        )}
        {imageUrl && !imageLoading && !imageError && (
          <img 
            src={imageUrl} 
            alt="Pin location" 
            className="w-full h-48 object-cover rounded"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
        )}
      </div>
      
      <button
        onClick={() => onSidebarStateChange({ 
          mode: 'view-project', 
          data: { project: pin.project } 
        })}
        className="text-blue-500 hover:text-blue-700 text-sm"
      >
        ← Back to Project
      </button>
    </div>
  );
}
