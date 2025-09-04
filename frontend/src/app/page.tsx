'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Map from '@/components/Map';
import Sidebar from '@/components/Sidebar';
import { Region, Project, Pin, MapState, SidebarState, GeoJSONPolygon } from '@/types';
import { pinsApi } from '@/lib/api';
import { createPin } from '@/lib/server-actions';

export default function Home() {
  const router = useRouter();
  const [mapState, setMapState] = useState<MapState>({
    selectedRegion: null,
    selectedProject: null,
    selectedPin: null,
    drawingMode: null,
    editMode: null,
  });

  const [sidebarState, setSidebarState] = useState<SidebarState>({
    isOpen: true,
    mode: 'regions',
    data: {},
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Console log NEXT_PUBLIC_API_URL on first page load
  useEffect(() => {
  }, []);

  // Handle region selection
  const handleRegionSelect = useCallback((region: Region) => {
    router.push(`/region/${region.id}`);
  }, [router]);

  // Handle project selection
  const handleProjectSelect = useCallback((project: Project) => {
    if (mapState.selectedRegion) {
      router.push(`/region/${mapState.selectedRegion.id}/project/${project.id}`);
    }
  }, [router, mapState.selectedRegion]);

  // Handle pin selection
  const handlePinSelect = useCallback(async (pin: Pin) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch pin details with project info
      const pinDetails = await pinsApi.getById(pin.id);
      
      setMapState(prev => ({
        ...prev,
        selectedPin: pinDetails,
        drawingMode: null,
        editMode: null,
      }));
      
      setSidebarState(prev => ({
        ...prev,
        mode: 'view-pin',
        data: { pin: pinDetails },
      }));
    } catch (err) {
      setError('Failed to load pin details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle map state changes
  const handleMapStateChange = useCallback((newState: Partial<MapState>) => {
    setMapState(prev => ({ ...prev, ...newState }));
  }, []);

  // Handle sidebar state changes
  const handleSidebarStateChange = useCallback((newState: Partial<SidebarState>) => {
    setSidebarState(prev => ({ ...prev, ...newState }));
  }, []);

  // Handle project creation with polygon data
  const handleProjectCreation = useCallback((polygonData: GeoJSONPolygon) => {
    if (sidebarState.mode === 'create-project') {
      // Update the form data with the polygon
      setSidebarState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          geo_json: polygonData,
        },
      }));
    }
  }, [sidebarState.mode]);

  // Handle project editing with polygon data
  const handleProjectEditing = useCallback((polygonData: GeoJSONPolygon) => {
    if (sidebarState.mode === 'edit-project') {
      // Update the form data with the new polygon
      setSidebarState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          geo_json: polygonData,
        },
      }));
    }
  }, [sidebarState.mode]);

  // Handle pin creation
  const handlePinCreation = useCallback(async (latitude: number, longitude: number) => {
    if (!mapState.selectedProject) return;

    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('projectId', mapState.selectedProject.id.toString());
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
      
      const result = await createPin(formData);
      
      if (result.success) {
        // Refresh the project data to include the new pin
        await handleProjectSelect(mapState.selectedProject);
      } else {
        setError(result.error || 'Failed to create pin');
      }
    } catch (err) {
      setError('Failed to create pin');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [mapState.selectedProject, handleProjectSelect]);

  // Handle pin creation mode trigger
  useEffect(() => {
    const handleStartPinCreation = () => {
      if (mapState.selectedProject) {
        handleMapStateChange({ drawingMode: 'pin' });
      }
    };

    window.addEventListener('startPinCreation', handleStartPinCreation);
    return () => {
      window.removeEventListener('startPinCreation', handleStartPinCreation);
    };
  }, [mapState.selectedProject, handleMapStateChange]);

  // Handle pin editing mode trigger
  useEffect(() => {
    const handleStartPinEdit = (event: CustomEvent) => {
      const { pin } = event.detail;
      handleMapStateChange({ 
        selectedPin: pin,
        editMode: 'pin' 
      });
    };

    window.addEventListener('startPinEdit', handleStartPinEdit as EventListener);
    return () => {
      window.removeEventListener('startPinEdit', handleStartPinEdit as EventListener);
    };
  }, [handleMapStateChange]);

  // Handle pin edit mode exit
  useEffect(() => {
    const handleExitPinEdit = () => {
      handleMapStateChange({ editMode: null });
    };

    window.addEventListener('exitPinEdit', handleExitPinEdit);
    return () => {
      window.removeEventListener('exitPinEdit', handleExitPinEdit);
    };
  }, [handleMapStateChange]);

  // Handle project creation mode - enable drawing when entering create-project mode
  useEffect(() => {
    if (sidebarState.mode === 'create-project') {
      handleMapStateChange({ drawingMode: 'project', editMode: null });
    } else if (sidebarState.mode === 'edit-project' && sidebarState.data?.project) {
      handleMapStateChange({ editMode: 'project', drawingMode: null });
    } else {
      // Clear drawing/edit modes when leaving project creation/editing
      handleMapStateChange({ drawingMode: null, editMode: null });
    }
  }, [sidebarState.mode, sidebarState.data?.project, handleMapStateChange]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        sidebarState={sidebarState}
        mapState={mapState}
        onSidebarStateChange={handleSidebarStateChange}
        onMapStateChange={handleMapStateChange}
        onRegionSelect={handleRegionSelect}
        onProjectSelect={handleProjectSelect}
        onPinSelect={handlePinSelect}
      />
      
      {/* Main Map Area */}
      <div className="flex-1 relative">
        <Map
          mapState={mapState}
          onMapStateChange={handleMapStateChange}
          onPinClick={handlePinSelect}
          onProjectClick={handleProjectSelect}
          onPinCreation={handlePinCreation}
          onPolygonCreation={handleProjectCreation}
          onPolygonUpdate={handleProjectEditing}
        />
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          </div>
        )}
        
        {/* Error Overlay */}
        {error && (
          <div className="absolute top-4 left-4 right-4 z-40">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="text-red-700 hover:text-red-900"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setSidebarState(prev => ({ ...prev, isOpen: !prev.isOpen }))}
          className="absolute top-4 left-4 z-30 bg-white rounded-lg p-2 shadow-lg hover:bg-gray-50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {/* Project Creation Mode Indicator & Toolbar */}
        {mapState.drawingMode === 'project' && (
          <div className="absolute top-20 left-4 z-30 space-y-3">
            {/* Instructions Panel */}
            <div className="bg-blue-600 text-white px-6 py-4 rounded-lg shadow-xl border border-blue-500 max-w-sm">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <h4 className="font-semibold">Drawing Mode Active</h4>
              </div>
              <p className="text-sm mb-2">Click points on the map to draw your project area</p>
              <div className="text-xs space-y-1 text-blue-100">
                <p>• Click to place points</p>
                <p>• Double-click to finish</p>
                <p>• Press ESC to cancel</p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleMapStateChange({ drawingMode: null })}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                >
                  Cancel Drawing
                </button>
                <button
                  onClick={() => {
                    // This will be handled by the map component's keyboard listener
                    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Pin Creation Mode Indicator */}
        {mapState.drawingMode === 'pin' && (
          <div className="absolute top-20 left-4 z-30 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            <p className="text-sm">Click on the map to place a pin</p>
          </div>
        )}
      </div>
    </div>
  );
}
