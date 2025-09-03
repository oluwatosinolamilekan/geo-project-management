'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Map from '@/components/Map';
import Sidebar from '@/components/Sidebar';
import { Region, Project, Pin, MapState, SidebarState } from '@/types';
import { getRegionById, getProjectsByRegion } from '@/lib/server-actions';

export default function RegionPage() {
  const params = useParams();
  const router = useRouter();
  const regionId = params.regionId as string;

  const [mapState, setMapState] = useState<MapState>({
    selectedRegion: null,
    selectedProject: null,
    selectedPin: null,
    drawingMode: null,
    editMode: null,
  });

  const [sidebarState, setSidebarState] = useState<SidebarState>({
    isOpen: true,
    mode: 'projects',
    data: {},
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle pin creation mode
  useEffect(() => {
    const handleStartPinCreation = () => {
      // Set map state to pin creation mode
      handleMapStateChange({ drawingMode: 'pin' });
    };

    window.addEventListener('startPinCreation', handleStartPinCreation);
    return () => {
      window.removeEventListener('startPinCreation', handleStartPinCreation);
    };
  }, []);

  useEffect(() => {
    const loadRegion = async () => {
      try {
        setLoading(true);
              const regionResult = await getRegionById(parseInt(regionId));
      if (!regionResult.success) {
        throw new Error(regionResult.error || 'Failed to load region');
      }
      const region = regionResult.data;

      const projectsResult = await getProjectsByRegion(parseInt(regionId));
      if (!projectsResult.success) {
        throw new Error(projectsResult.error || 'Failed to load projects');
      }
      const projects = projectsResult.data;
        if (region && projects) {
          const regionWithProjects: Region = {
            ...region,
            projects,
            id: region.id || 0,
            name: region.name || '',
            created_at: region.created_at || '',
            updated_at: region.updated_at || ''
          };

          setMapState(prev => ({
            ...prev,
            selectedRegion: regionWithProjects,
            selectedProject: null,
            selectedPin: null,
          }));

          setSidebarState(prev => ({
            ...prev,
            mode: 'projects',
            data: { region: regionWithProjects },
          }));
        }
      } catch (err) {
        setError('Failed to load region data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadRegion();
  }, [regionId]);

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
  };

  const handleSidebarStateChange = (newState: Partial<SidebarState>) => {
    setSidebarState(prev => ({ ...prev, ...newState }));
  };

  const handlePolygonCreation = (polygonData: any) => {
    console.log('RegionPage - handlePolygonCreation called with:', polygonData);
    // Update sidebar state to include the polygon data
    setSidebarState(prev => ({
      ...prev,
      mode: 'create-project',
      data: {
        ...prev.data,
        geo_json: polygonData
      }
    }));
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
          onPolygonCreation={handlePolygonCreation}
          isRegionPage={true}
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
