'use client';

import { useState, useEffect } from 'react';
import Map from '@/components/Map';
import Sidebar from '@/components/Sidebar';
import { Region, Project, Pin, MapState, SidebarState } from '@/types';
import { regionsApi, projectsApi, pinsApi } from '@/lib/api';
import { createPin } from '@/lib/server-actions';

export default function Home() {
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
    data: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle region selection
  const handleRegionSelect = async (region: Region) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch projects for the region
      const projects = await projectsApi.getByRegion(region.id);
      const regionWithProjects = { ...region, projects };
      
      setMapState(prev => ({
        ...prev,
        selectedRegion: regionWithProjects,
        selectedProject: null,
        selectedPin: null,
        drawingMode: null,
        editMode: null,
      }));
      
      setSidebarState(prev => ({
        ...prev,
        mode: 'projects',
        data: { region: regionWithProjects },
      }));
    } catch (err) {
      setError('Failed to load projects for this region');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle project selection
  const handleProjectSelect = async (project: Project) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch pins for the project
      const pins = await pinsApi.getByProject(project.id);
      const projectWithPins = { ...project, pins };
      
      setMapState(prev => ({
        ...prev,
        selectedProject: projectWithPins,
        selectedPin: null,
        drawingMode: null,
        editMode: null,
      }));
      
      setSidebarState(prev => ({
        ...prev,
        mode: 'view-project',
        data: { project: projectWithPins },
      }));
    } catch (err) {
      setError('Failed to load pins for this project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle pin selection
  const handlePinSelect = async (pin: Pin) => {
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
  };

  // Handle map state changes
  const handleMapStateChange = (newState: Partial<MapState>) => {
    setMapState(prev => ({ ...prev, ...newState }));
  };

  // Handle sidebar state changes
  const handleSidebarStateChange = (newState: Partial<SidebarState>) => {
    setSidebarState(prev => ({ ...prev, ...newState }));
  };

  // Handle project creation with polygon data
  const handleProjectCreation = (polygonData: any) => {
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
  };

  // Handle project editing with polygon data
  const handleProjectEditing = (polygonData: any) => {
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
  };

  // Handle pin creation
  const handlePinCreation = async (latitude: number, longitude: number) => {
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
  };

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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        sidebarState={sidebarState}
        mapState={mapState}
        onSidebarStateChange={handleSidebarStateChange}
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
        
        {/* Project Creation Mode Indicator */}
        {mapState.drawingMode === 'project' && (
          <div className="absolute bottom-4 left-4 z-30 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
            <p className="text-sm">Click and drag to draw a polygon for your project</p>
          </div>
        )}
        
        {/* Pin Creation Mode Indicator */}
        {mapState.drawingMode === 'pin' && (
          <div className="absolute bottom-4 left-4 z-30 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            <p className="text-sm">Click on the map to place a pin</p>
          </div>
        )}
      </div>
    </div>
  );
}
