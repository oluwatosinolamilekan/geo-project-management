'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Map from '@/components/Map';
import Sidebar from '@/components/Sidebar';
import { Region, Project, Pin, MapState, SidebarState } from '@/types';
import { getPinDetails } from '@/lib/server-actions';

export default function PinPage() {
  const params = useParams();
  const router = useRouter();
  const regionId = params.regionId as string;
  const projectId = params.projectId as string;
  const pinId = params.pinId as string;

  const [mapState, setMapState] = useState<MapState>({
    selectedRegion: null,
    selectedProject: null,
    selectedPin: null,
    drawingMode: null,
    editMode: null,
  });

  const [sidebarState, setSidebarState] = useState<SidebarState>({
    isOpen: true,
    mode: 'view-pin',
    data: {},
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPinData = async () => {
      try {
        setLoading(true);
        
        // Load all pin data in a single request
        const result = await getPinDetails(parseInt(pinId));
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to load pin details');
        }
        
        const { pin, project, region, pins } = result.data;
        
        if (region && project && pin) {
          // Construct the project with all pins
          const projectWithPins: Project = {
            ...project,
            pins,
            id: project.id || 0,
            region_id: project.region_id || 0,
            name: project.name || '',
            geo_json: project.geo_json || { type: 'Polygon', coordinates: [] },
            created_at: project.created_at || '',
            updated_at: project.updated_at || ''
          };

          // Construct the region with the project
          const regionWithProject: Region = {
            ...region,
            projects: [projectWithPins],
            id: region.id || 0,
            name: region.name || '',
            created_at: region.created_at || '',
            updated_at: region.updated_at || ''
          };

          // Ensure pin has project reference
          const pinWithProject: Pin = {
            ...pin,
            project: projectWithPins,
            id: pin.id || 0,
            project_id: pin.project_id || 0,
            latitude: pin.latitude || 0,
            longitude: pin.longitude || 0,
            created_at: pin.created_at || '',
            updated_at: pin.updated_at || ''
          };

          // Update map state
          setMapState(prev => ({
            ...prev,
            selectedRegion: regionWithProject,
            selectedProject: projectWithPins,
            selectedPin: pinWithProject,
          }));

          // Update sidebar state
          setSidebarState(prev => ({
            ...prev,
            mode: 'view-pin',
            data: { 
              pin: pinWithProject,
              project: projectWithPins,
              region: regionWithProject
            },
          }));
        }
      } catch (err) {
        setError('Failed to load pin data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPinData();
  }, [regionId, projectId, pinId]);

  const handleRegionSelect = (region: Region) => {
    router.push(`/region/${region.id}`);
  };

  const handleProjectSelect = (project: Project) => {
    router.push(`/region/${regionId}/project/${project.id}`);
  };

  const handlePinSelect = (pin: Pin) => {
    router.push(`/region/${regionId}/project/${projectId}/pin/${pin.id}`);
  };

  const handleMapStateChange = (newState: Partial<MapState>) => {
    setMapState(prev => ({ ...prev, ...newState }));
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
