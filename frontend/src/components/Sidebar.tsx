'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Region, Project, Pin, SidebarState, MapState } from '@/types';
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

interface SidebarProps {
  sidebarState: SidebarState;
  mapState: MapState;
  onSidebarStateChange: (state: Partial<SidebarState>) => void;
  onRegionSelect: (region: Region) => void;
  onProjectSelect: (project: Project) => void;
  onPinSelect: (pin: Pin) => void;
}

export default function Sidebar({ 
  sidebarState, 
  mapState,
  onSidebarStateChange, 
  onRegionSelect, 
  onProjectSelect, 
  onPinSelect 
}: SidebarProps) {
  const router = useRouter();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
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
        setFormData({});
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
    e.preventDefault();
    if (!formData.name || typeof formData.name !== 'string' || !formData.name.trim() || !formData.geo_json) return;

    try {
      setLoading(true);
      const formDataObj = new FormData();
      formDataObj.append('regionId', sidebarState.data.region?.id.toString() || '');
      formDataObj.append('name', (formData.name as string).trim());
      formDataObj.append('geoJson', JSON.stringify(formData.geo_json));
      
      const result = await createProject(formDataObj);
      
      if (result.success) {
        setFormData({});
        onSidebarStateChange({ mode: 'projects', data: { region: sidebarState.data.region } });
        // Refresh the region data to include the new project
        if (sidebarState.data.region) {
          onRegionSelect(sidebarState.data.region);
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
        setFormData({});
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
        setFormData({});
        onSidebarStateChange({ mode: 'view-project', data: { project: sidebarState.data.project } });
        // Refresh the project data
        onProjectSelect(sidebarState.data.project);
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
        setFormData({});
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
          onSidebarStateChange({ mode: 'projects', data: { region: sidebarState.data.region } });
          // Refresh the region data
          onRegionSelect(sidebarState.data.region);
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
          onProjectSelect={onProjectSelect}
          onDeleteProject={handleDeleteProject}
        />
      )}
      
      {sidebarState.mode === 'create-region' && (
        <CreateRegionForm
          formData={formData}
          loading={loading}
          onFormDataChange={setFormData}
          onSubmit={handleCreateRegion}
          onCancel={() => onSidebarStateChange({ mode: 'regions', data: {} })}
        />
      )}
      
      {sidebarState.mode === 'create-project' && (
        <CreateProjectForm
          formData={formData}
          loading={loading}
          onFormDataChange={setFormData}
          onSubmit={handleCreateProject}
          onCancel={() => onSidebarStateChange({ mode: 'projects', data: { region: sidebarState.data.region } })}
        />
      )}
      
      {sidebarState.mode === 'view-project' && sidebarState.data.project && (
        <ViewProject
          project={sidebarState.data.project}
          onSidebarStateChange={onSidebarStateChange}
          onDeleteProject={handleDeleteProject}
          onPinSelect={onPinSelect}
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
          onFormDataChange={setFormData}
          onSubmit={handleUpdateRegion}
          onCancel={() => onSidebarStateChange({ mode: 'regions', data: {} })}
        />
      )}
      
      {sidebarState.mode === 'edit-project' && sidebarState.data.project && (
        <EditProjectForm
          project={sidebarState.data.project}
          formData={formData}
          loading={loading}
          onFormDataChange={setFormData}
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
          onFormDataChange={setFormData}
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
    </div>
  );
}
