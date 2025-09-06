'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Map from '@/components/Map';
import Sidebar from '@/components/Sidebar';
import { Region, Project, Pin, MapState, SidebarState } from '@/types';
import { getProjectDetails } from '@/lib/server-actions';

export default function AddPinPage() {
  const params = useParams();
  const router = useRouter();
  const regionId = params.regionId as string;
  const projectId = params.projectId as string;

  const [mapState, setMapState] = useState<MapState>({
    selectedRegion: null,
    selectedProject: null,
    selectedPin: null,
    drawingMode: 'pin', // Start in pin creation mode
    editMode: null,
  });

  const [sidebarState, setSidebarState] = useState<SidebarState>({
    isOpen: true,
    mode: 'create-pin',
    data: {},
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load project and region data in a single request
        const result = await getProjectDetails(parseInt(projectId));
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to load project details');
        }
        
        const { project, region } = result.data;
        
        if (project && region) {
          // Update map state with project
          setMapState(prev => ({
            ...prev,
            selectedRegion: region,
            selectedProject: project,
          }));

          // Update sidebar state with project for pin creation
          setSidebarState(prev => ({
            ...prev,
            mode: 'create-pin',
            data: { project, region },
          }));
        }
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId, regionId]);

  const handleRegionSelect = (region: Region) => {
    router.push(`/region/${region.id}`);
  };

  const handleProjectSelect = (project: Project) => {
    router.push(`/region/${regionId}/project/${project.id}`);
  };

  const handlePinSelect = (pin: Pin) => {
    setMapState(prev => ({
      ...prev,
      selectedPin: pin,
    }));
  };

  const handleMapStateChange = (newState: Partial<MapState>) => {
    setMapState(prev => ({ ...prev, ...newState }));
    
    // If a pin location was selected, update the sidebar state with the coordinates
    const selectedPin = newState.selectedPin;
    if (selectedPin && typeof selectedPin.latitude === 'number' && typeof selectedPin.longitude === 'number') {
      setSidebarState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          latitude: selectedPin.latitude,
          longitude: selectedPin.longitude
        }
      }));
    }
  };

  const handleSidebarStateChange = (newState: Partial<SidebarState>) => {
    setSidebarState(prev => ({ ...prev, ...newState }));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        sidebarState={sidebarState}
        mapState={mapState}
        onSidebarStateChange={handleSidebarStateChange}
        onMapStateChange={handleMapStateChange}
        onRegionSelect={handleRegionSelect}
        onProjectSelect={handleProjectSelect}
        onPinSelect={handlePinSelect}
      />
      
      <div className="flex-1 relative">
        <Map
          mapState={mapState}
          onMapStateChange={handleMapStateChange}
          onPinClick={handlePinSelect}
          onProjectClick={handleProjectSelect}
        />
        
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          </div>
        )}
        
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
      </div>
    </div>
  );
}
