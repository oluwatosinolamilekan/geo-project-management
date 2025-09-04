'use client';

import { useState, useEffect, useRef } from 'react';
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
  const imgRef = useRef<HTMLImageElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const loadedRef = useRef<boolean>(false);

  const loadImage = () => {
    // Use both timestamp and random number to ensure cache busting
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 1000000);
    
    setImageLoading(true);
    setImageError(false);
    loadedRef.current = false;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set timeout to handle cases where image doesn't load
    timeoutRef.current = setTimeout(() => {
      if (!loadedRef.current) {
        setImageLoading(false);
        setImageError(true);
      }
    }, 8000); // 8 second timeout

    // Use both timestamp and random to ensure a unique URL every time
    const newImageUrl = `https://picsum.photos/400/300?random=${randomId}&t=${timestamp}`;
    setImageUrl(newImageUrl);
    
    // Preload the image to help with tab switching
    const preloadImg = new Image();
    preloadImg.src = newImageUrl;
  };

  // Load a new image whenever the pin changes or component mounts
  useEffect(() => {
    loadImage();
    
    // Handle visibility change to reload image when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !loadedRef.current) {
        loadImage();
      }
    };
    
    // Add event listener for visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pin.id]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Pin #{pin.id}</h2>
        <p className="text-sm text-gray-600 font-medium mt-1">Pin Details</p>
      </div>
      
      {/* Pin Details */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="grid gap-4">
          <div className="grid grid-cols-[120px,1fr] items-baseline">
            <span className="text-lg font-bold text-gray-800">Pin ID:</span>
            <span className="text-lg text-gray-700 font-medium truncate">#{pin.id}</span>
          </div>
          
          <div className="grid grid-cols-[120px,1fr] items-baseline">
            <span className="text-lg font-bold text-gray-800">Project:</span>
            <span className="text-lg text-gray-700 font-medium break-words">{pin.project?.name}</span>
          </div>
          
          <div className="grid grid-cols-[120px,1fr] items-baseline">
            <span className="text-lg font-bold text-gray-800">Coordinates:</span>
            <div className="flex flex-col">
              <span className="text-lg text-gray-700 font-mono">
                {pin.latitude ? Number(pin.latitude).toFixed(6) : 'N/A'}°,
              </span>
              <span className="text-lg text-gray-700 font-mono">
                {pin.longitude ? Number(pin.longitude).toFixed(6) : 'N/A'}°
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pin Image */}
      <div className="w-full h-72 rounded-lg border border-gray-200 overflow-hidden relative shadow-sm">
        {imageUrl && !imageError ? (
          <>
            <img 
              ref={imgRef}
              src={imageUrl} 
              alt="Pin location" 
              className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => {
                setImageLoading(false);
                setImageError(false);
                loadedRef.current = true;
              }}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
                loadedRef.current = false;
              }}
            />
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-500 text-lg">No image available</span>
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
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-3 shadow-sm"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-lg">Back to Project</span>
      </button>
    </div>
  );
}
