'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Region, Project, Pin, SidebarState, MapState, GeoJSONPolygon } from '@/types';
import { 
  getAllRegions,
  getRegionById,
  getProjectsByRegion,
  getProjectById,
  getPinsByProject,
  getPinById,
  createRegion,
  updateRegion,
  deleteRegion,
  createProject,
  updateProject,
  deleteProject,
  createPin,
  updatePin,
  deletePin
} from '@/lib/server-actions';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import RegionsList from './RegionsList';
import ProjectsList from './ProjectsList';
import CreateRegionForm from './CreateRegionForm';
import CreateProjectForm from './CreateProjectForm';
import ViewProject from './ViewProject';
import ViewPin from './ViewPin';
import EditRegionForm from './EditRegionForm';
import EditProjectForm from './EditProjectForm';
import EditPinForm from './EditPinForm';
import CreatePinForm from './CreatePinForm';

interface SidebarProps {
  sidebarState: SidebarState;
  mapState: MapState;
  onSidebarStateChange: (state: Partial<SidebarState>) => void;
  onMapStateChange: (state: Partial<MapState>) => void;
  onRegionSelect: (region: Region) => void;
  onProjectSelect: (project: Project) => void;
  onPinSelect: (pin: Pin) => void;
}

export default function Sidebar({ 
  sidebarState, 
  mapState,
  onSidebarStateChange,
  onMapStateChange, 
  onRegionSelect, 
  onProjectSelect, 
  onPinSelect 
}: SidebarProps) {
  const router = useRouter();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  interface RegionFormData {
    name: string;
  }

  interface ProjectFormData {
    name: string;
    geo_json?: GeoJSONPolygon;
  }

  interface PinFormData {
    latitude: number;
    longitude: number;
  }

  type FormData = RegionFormData & ProjectFormData & PinFormData;

  const defaultFormData: FormData = {
    name: '',
    latitude: 0,
    longitude: 0
  };
  
  const [formData, setFormData] = useState<FormData>(defaultFormData);

  // Form data change handlers
  const handleRegionFormChange = (data: RegionFormData) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleProjectFormChange = (data: ProjectFormData) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handlePinFormChange = (data: PinFormData) => {
    setFormData(prev => ({ ...prev, ...data }));
  };
  const { showDeleteSuccess, showDeleteError, showWarning } = useNotificationActions();

  const loadRegions = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAllRegions();
      if (result.success) {
        setRegions(result.data || []);
      } else {
        setError(result.error || 'Failed to load regions');
      }
    } catch (err) {
      setError('Failed to load regions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load regions on mount
  useEffect(() => {
    loadRegions();
  }, [loadRegions]);



  // Update formData when sidebarState.data.geo_json changes
  useEffect(() => {
    if (sidebarState.data.geo_json) {
      console.log('Sidebar - Updating formData with geoJson:', sidebarState.data.geo_json);
      setFormData(prev => ({
        ...prev,
        geo_json: sidebarState.data.geo_json
      }));
    }
  }, [sidebarState.data.geo_json]);

  const handleCreateRegion = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || typeof formData.name !== 'string' || !formData.name.trim()) return;

    try {
      setLoading(true);
      const formDataObj = new FormData();
      formDataObj.append('name', (formData.name as string).trim());
      
      const result = await createRegion(formDataObj);
      
      if (result.success) {
        setRegions([...regions, result.data as Region]);
        setFormData(defaultFormData);
        onSidebarStateChange({ mode: 'regions', data: {} });
      } else {
        setError(result.error || 'Failed to create region');
      }
    } catch (err) {
      setError('Failed to create region');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [formData.name, regions, onSidebarStateChange]);

  const handleCreateProject = useCallback(async (e: React.FormEvent) => {
    console.log('Sidebar - handleCreateProject called');
    console.log('Current formData:', JSON.stringify(formData, null, 2));
    
    e.preventDefault();
    
    // Validate name
    if (!formData.name || typeof formData.name !== 'string' || !formData.name.trim()) {
      console.log('Sidebar - name validation failed', { 
        name: formData.name,
        nameType: typeof formData.name,
        hasName: !!formData.name,
        isString: typeof formData.name === 'string',
        hasTrimmedContent: formData.name?.trim?.()
      });
      setError('Please enter a project name');
      return;
    }
    
    // Validate geoJson
    if (!formData.geo_json) {
      console.log('Sidebar - geoJson validation failed - geoJson is missing');
      setError('Please draw a project boundary on the map first');
      return;
    }

    // Validate geoJson structure
    const geoJson = formData.geo_json;
    if (!geoJson.type || geoJson.type !== 'Polygon' || !Array.isArray(geoJson.coordinates)) {
      console.error('Invalid geoJson structure:', geoJson);
      setError('Invalid project boundary data');
      return;
    }

    // Log the geoJson structure
    console.log('Sidebar - Valid geoJson found:', {
      type: geoJson.type,
      coordinates: geoJson.coordinates,
      coordinatesLength: geoJson.coordinates.length
    });

    try {
      setLoading(true);
      const formDataObj = new FormData();
      formDataObj.append('regionId', sidebarState.data.region?.id.toString() || '');
      formDataObj.append('name', (formData.name as string).trim());
      formDataObj.append('geoJson', JSON.stringify(formData.geo_json));
      
      const result = await createProject(formDataObj);
      
      if (result.success) {
        setFormData(defaultFormData);
        
        // Get the newly created project from the result
        const newProject = result.data as Project;
        
        // Update the region's projects list immediately
        if (sidebarState.data.region) {
          const updatedRegion: Region = {
            ...sidebarState.data.region,
            projects: [
              ...(sidebarState.data.region.projects || []),
              newProject
            ]
          };
          
          // Update sidebar state with the new project list
          onSidebarStateChange({ 
            mode: 'projects', 
            data: { 
              region: updatedRegion
            } 
          });
          
          // Also update the region in the parent component
          onRegionSelect(updatedRegion);
        }
      } else {
        setError(result.error || 'Failed to create project');
      }
    } catch (err) {
      setError('Failed to create project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [formData.name, formData.geo_json, sidebarState.data, onSidebarStateChange, onRegionSelect]);

  const handleUpdateRegion = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || typeof formData.name !== 'string' || !formData.name.trim() || !sidebarState.data.region?.id) return;

    try {
      setLoading(true);
      const formDataObj = new FormData();
      formDataObj.append('id', sidebarState.data.region.id.toString());
      formDataObj.append('name', (formData.name as string).trim());
      
      const result = await updateRegion(formDataObj);
      
      if (result.success) {
        setRegions(regions.map(r => r.id === sidebarState.data.region?.id ? { ...r, name: (formData.name as string).trim() } : r));
        setFormData(defaultFormData);
        onSidebarStateChange({ mode: 'regions', data: {} });
      } else {
        setError(result.error || 'Failed to update region');
      }
    } catch (err) {
      setError('Failed to update region');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [formData.name, regions, onSidebarStateChange]);

  const handleUpdateProject = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || typeof formData.name !== 'string' || !formData.name.trim() || !sidebarState.data.project?.id) return;

    try {
      setLoading(true);
      const formDataObj = new FormData();
      formDataObj.append('id', sidebarState.data.project.id.toString());
      formDataObj.append('name', (formData.name as string).trim());
      if (formData.geo_json) {
        formDataObj.append('geoJson', JSON.stringify(formData.geo_json));
      }
      
      const result = await updateProject(formDataObj);
      
      if (result.success) {
        setFormData(defaultFormData);
        // Fetch updated project data with pins
        if (sidebarState.data.project) {
          const projectId = sidebarState.data.project.id;
          const regionId = sidebarState.data.project.region_id;
          
          try {
            // Get updated project data
            const projectResult = await getProjectById(projectId);
            if (!projectResult.success) {
              throw new Error(projectResult.error || 'Failed to load project');
            }
            const project = projectResult.data;

            // Get project pins
            const pinsResult = await getPinsByProject(projectId);
            if (!pinsResult.success) {
              throw new Error(pinsResult.error || 'Failed to load pins');
            }
            const pins = pinsResult.data;

            // Get region data for navigation context
            const regionResult = await getRegionById(regionId);
            if (!regionResult.success) {
              throw new Error(regionResult.error || 'Failed to load region');
            }
            const region = regionResult.data;

            // Get all projects for the region
            const projectsResult = await getProjectsByRegion(regionId);
            if (!projectsResult.success) {
              throw new Error(projectsResult.error || 'Failed to load projects');
            }
            const projects = projectsResult.data;

            if (!region) {
              throw new Error('Region data is missing');
            }

            // Update the region with all projects
            const regionWithProjects: Region = {
              ...region,
              projects,
              id: region.id,
              name: region.name,
              created_at: region.created_at,
              updated_at: region.updated_at
            };

            if (!project) {
              throw new Error('Project data is missing');
            }

            // Update the project with its pins
            const updatedProject: Project = {
              id: project.id,
              region_id: project.region_id,
              name: project.name,
              geo_json: project.geo_json,
              created_at: project.created_at,
              updated_at: project.updated_at,
              pins,
              region: regionWithProjects
            };

            // Update both the sidebar state and selected project
            onSidebarStateChange({ 
              mode: 'view-project', 
              data: { 
                project: updatedProject,
                region: regionWithProjects 
              } 
            });
            onProjectSelect(updatedProject);
          } catch (err) {
            setError('Failed to load updated project data');
            console.error(err);
          }
        }
      } else {
        setError(result.error || 'Failed to update project');
      }
    } catch (err) {
      setError('Failed to update project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [formData.name, formData.geo_json, onSidebarStateChange, onProjectSelect]);

  const handleCreatePin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const projectId = sidebarState.data.project?.id;
    const latitude = mapState.selectedPin?.latitude;
    const longitude = mapState.selectedPin?.longitude;
    
    if (!projectId || !latitude || !longitude) return;

    try {
      setLoading(true);
      const formDataObj = new FormData();
      formDataObj.append('projectId', projectId.toString());
      formDataObj.append('latitude', latitude.toString());
      formDataObj.append('longitude', longitude.toString());
      
      const result = await createPin(formDataObj);
      
      if (result.success) {
        setFormData(defaultFormData);
        // Exit pin creation mode
        onMapStateChange({ drawingMode: null });
        if (sidebarState.data.project) {
          onSidebarStateChange({ mode: 'view-project', data: { project: sidebarState.data.project } });
          // Refresh the project data
          onProjectSelect(sidebarState.data.project);
        }
      } else {
        setError(result.error || 'Failed to create pin');
      }
    } catch (err) {
      setError('Failed to create pin');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [mapState.selectedPin, sidebarState.data.project, onMapStateChange, onSidebarStateChange, onProjectSelect]);

  const handleUpdatePin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const pinId = sidebarState.data.pin?.id;
    const latitude = formData.latitude || mapState.selectedPin?.latitude || sidebarState.data.pin?.latitude;
    const longitude = formData.longitude || mapState.selectedPin?.longitude || sidebarState.data.pin?.longitude;
    
    if (!latitude || !longitude || !pinId) return;

    try {
      setLoading(true);
      const formDataObj = new FormData();
      formDataObj.append('id', pinId.toString());
      formDataObj.append('latitude', latitude.toString());
      formDataObj.append('longitude', longitude.toString());
      
      const result = await updatePin(formDataObj);
      
      if (result.success) {
        setFormData(defaultFormData);
        // Exit edit mode
        const event = new CustomEvent('exitPinEdit');
        window.dispatchEvent(event);
        onSidebarStateChange({ mode: 'view-pin', data: { pin: sidebarState.data.pin } });
        // Refresh the pin data
        if (sidebarState.data.pin) {
          onPinSelect(sidebarState.data.pin);
        }
      } else {
        setError(result.error || 'Failed to update pin');
      }
    } catch (err) {
      setError('Failed to update pin');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [formData.latitude, formData.longitude, mapState.selectedPin, onSidebarStateChange, onPinSelect]);

  const handleDeleteRegion = useCallback(async (region: Region) => {
    // First confirmation for general deletion
    if (!confirm(`Are you sure you want to delete "${region.name}"?`)) return;

    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      const formDataObj = new FormData();
      formDataObj.append('id', region.id.toString());
      
      const result = await deleteRegion(formDataObj);
      
      if (result.success) {
        setRegions(regions.filter(r => r.id !== region.id));
        showDeleteSuccess('Region');
      } else {
        const errorMessage = result.error || 'Failed to delete region';
        
        // If there are associated projects, ask for confirmation to delete everything
        if (errorMessage.includes('has associated projects')) {
          const confirmDelete = confirm(
            `Warning: This region has associated projects. Would you like to delete the region and all its projects?`
          );
          
          if (confirmDelete) {
            // Add force delete flag
            formDataObj.append('force_delete', 'true');
            const forceResult = await deleteRegion(formDataObj);
            
            if (forceResult.success) {
              setRegions(regions.filter(r => r.id !== region.id));
              showDeleteSuccess('Region and its projects');
            } else {
              showDeleteError('Region', forceResult.error || 'Failed to delete region and its projects');
            }
          }
        } else {
          setError(errorMessage);
          showDeleteError('Region', errorMessage);
        }
      }
    } catch (err) {
      const errorMessage = 'Failed to delete region';
      setError(errorMessage);
      showDeleteError('Region', errorMessage);
      console.error('Delete region exception:', err);
    } finally {
      setLoading(false);
    }
  }, [regions, showDeleteSuccess, showDeleteError, showWarning]);

  const handleDeleteProject = useCallback(async (project: Project) => {
    if (!confirm(`Are you sure you want to delete "${project.name}" and all its pins?`)) return;

    try {
      setLoading(true);
      const formDataObj = new FormData();
      formDataObj.append('id', project.id.toString());
      
      const result = await deleteProject(formDataObj);
      
      if (result.success) {
        if (sidebarState.data.region) {
          // Remove the deleted project from the region's projects list
          const updatedRegion: Region = {
            ...sidebarState.data.region,
            projects: sidebarState.data.region.projects?.filter(p => p.id !== project.id) || []
          };

          // Update sidebar state with the filtered project list
          onSidebarStateChange({ 
            mode: 'projects', 
            data: { 
              region: updatedRegion
            } 
          });

          // Update the region in the parent component
          onRegionSelect(updatedRegion);
        }
      } else {
        setError(result.error || 'Failed to delete project');
      }
    } catch (err) {
      setError('Failed to delete project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [onSidebarStateChange, onRegionSelect]);

  const handleDeletePin = useCallback(async (pin: Pin) => {
    if (!confirm('Are you sure you want to delete this pin?')) return;

    try {
      setLoading(true);
      const formDataObj = new FormData();
      formDataObj.append('id', pin.id.toString());
      
      const result = await deletePin(formDataObj);
      
      if (result.success) {
        if (sidebarState.data.project) {
          onSidebarStateChange({ mode: 'view-project', data: { project: sidebarState.data.project } });
          // Refresh the project data
          onProjectSelect(sidebarState.data.project);
        }
      } else {
        setError(result.error || 'Failed to delete pin');
      }
    } catch (err) {
      setError('Failed to delete pin');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [onSidebarStateChange, onProjectSelect]);


  if (!sidebarState.isOpen) return null;

  const handleBack = useCallback(() => {
    if (sidebarState.mode === 'view-project' && sidebarState.data.project) {
      // If viewing a project, go back to region view
      router.push(`/region/${sidebarState.data.project.region_id}`);
    } else if (sidebarState.mode === 'projects' && sidebarState.data.region) {
      // If viewing projects list, go back to regions
      router.push('/');
    }
  }, [router, sidebarState.mode, sidebarState.data]);

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
      {/* Back Button */}
      {(sidebarState.mode === 'projects' || sidebarState.mode === 'view-project') && (
        <button
          onClick={handleBack}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {sidebarState.mode === 'regions' && (
        <RegionsList
          regions={regions}
          loading={loading}
          error={error}
          onSidebarStateChange={onSidebarStateChange}
          onRegionSelect={onRegionSelect}
          onDeleteRegion={handleDeleteRegion}
        />
      )}
      
      {sidebarState.mode === 'projects' && (
        <ProjectsList
          sidebarState={sidebarState}
          loading={loading}
          error={error}
          onSidebarStateChange={onSidebarStateChange}
          onMapStateChange={onMapStateChange}
          onProjectSelect={onProjectSelect}
          onDeleteProject={handleDeleteProject}
        />
      )}
      
      {sidebarState.mode === 'create-region' && (
        <CreateRegionForm
          formData={formData}
          loading={loading}
          onFormDataChange={handleRegionFormChange}
          onSubmit={handleCreateRegion}
          onCancel={() => onSidebarStateChange({ mode: 'regions', data: {} })}
        />
      )}
      
      {sidebarState.mode === 'create-project' && (
        <CreateProjectForm
          formData={formData}
          loading={loading}
          onFormDataChange={handleProjectFormChange}
          onSubmit={handleCreateProject}
          onCancel={() => onSidebarStateChange({ mode: 'projects', data: { region: sidebarState.data.region } })}
          showForm={mapState.showProjectForm || false}
        />
      )}
      
      {sidebarState.mode === 'view-project' && sidebarState.data.project && (
        <ViewProject
          project={sidebarState.data.project}
          onSidebarStateChange={onSidebarStateChange}
          onDeleteProject={handleDeleteProject}
          onPinSelect={onPinSelect}
          onEditPin={(pin) => onSidebarStateChange({ mode: 'edit-pin', data: { pin } })}
          onDeletePin={handleDeletePin}
        />
      )}
      
      {sidebarState.mode === 'view-pin' && sidebarState.data.pin && (
        <ViewPin
          pin={sidebarState.data.pin}
          onSidebarStateChange={onSidebarStateChange}
          onDeletePin={handleDeletePin}
        />
      )}
      
      {sidebarState.mode === 'edit-region' && sidebarState.data.region && (
        <EditRegionForm
          region={sidebarState.data.region}
          formData={formData}
          loading={loading}
          onFormDataChange={handleRegionFormChange}
          onSubmit={handleUpdateRegion}
          onCancel={() => onSidebarStateChange({ mode: 'regions', data: {} })}
        />
      )}
      
      {sidebarState.mode === 'edit-project' && sidebarState.data.project && (
        <EditProjectForm
          project={sidebarState.data.project}
          formData={formData}
          loading={loading}
          onFormDataChange={handleProjectFormChange}
          onSubmit={handleUpdateProject}
          onCancel={() => onSidebarStateChange({ 
            mode: 'view-project', 
            data: { project: sidebarState.data.project } 
          })}
        />
      )}
      
      {sidebarState.mode === 'edit-pin' && sidebarState.data.pin && (
        <EditPinForm
          pin={sidebarState.data.pin}
          mapState={mapState}
          formData={formData}
          loading={loading}
          onFormDataChange={handlePinFormChange}
          onSubmit={handleUpdatePin}
          onCancel={() => {
            // Exit edit mode
            const event = new CustomEvent('exitPinEdit');
            window.dispatchEvent(event);
            onSidebarStateChange({ 
              mode: 'view-pin', 
              data: { pin: sidebarState.data.pin } 
            });
          }}
        />
      )}

      {sidebarState.mode === 'create-pin' && sidebarState.data.project && (
        <CreatePinForm
          project={sidebarState.data.project}
          latitude={mapState.selectedPin?.latitude || 0}
          longitude={mapState.selectedPin?.longitude || 0}
          loading={loading}
          onSubmit={handleCreatePin}
          onCancel={() => {
            // Exit pin creation mode
            onMapStateChange({ drawingMode: null });
            onSidebarStateChange({ 
              mode: 'view-project', 
              data: { project: sidebarState.data.project } 
            });
          }}
        />
      )}
    </div>
  );
}
