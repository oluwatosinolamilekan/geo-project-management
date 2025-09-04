'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const loadImage = () => {
    // Use both timestamp and random number to ensure cache busting
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 1000000);
    
    setImageLoading(true);
    setImageError(false);
    
    // Set timeout to handle cases where image doesn't load
    const timeoutId = setTimeout(() => {
      setImageLoading(false);
      setImageError(true);
    }, 8000); // 8 second timeout

    // Use both timestamp and random to ensure a unique URL every time
    setImageUrl(`https://picsum.photos/400/300?random=${randomId}&t=${timestamp}`);
    
    return timeoutId;
  };

  // Load a new image whenever the pin changes or component mounts
  useEffect(() => {
    const timeoutId = loadImage();
    
    // Clear timeout when component unmounts or when pin changes
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
      
      {/* Pin Details */}
      <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">Pin ID:</span>
          <span className="text-gray-800 font-medium">#{pin.id}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">Project:</span>
          <span className="text-gray-800 font-medium">{pin.project?.name}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">Coordinates:</span>
          <span className="text-gray-800 font-mono text-sm">
            {pin.latitude ? Number(pin.latitude).toFixed(6) : 'N/A'}°, {pin.longitude ? Number(pin.longitude).toFixed(6) : 'N/A'}°
          </span>
        </div>
      </div>
      
      {/* Pin Image */}
      <div className="w-full h-48 rounded-lg border border-gray-200 overflow-hidden relative">
        {imageUrl && !imageError ? (
          <>
            <img 
              src={imageUrl} 
              alt="Pin location" 
              className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => {
                setImageLoading(false);
                setImageError(false);
              }}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-500">No image available</span>
          </div>
        )}
      </div>
      
      <button
        onClick={() => {
          if (pin.project) {
            // Use Next.js router for navigation
            router.push(`/region/${pin.project.region_id}/project/${pin.project.id}`);
          }
        }}
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
