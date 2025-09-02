'use client';

import { useState, useEffect, useCallback } from 'react';
import { Region, Project, Pin, SidebarState, MapState } from '@/types';
import { regionsApi, projectsApi, pinsApi } from '@/lib/api';
import { 
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
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  const loadRegions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await regionsApi.getAll();
      setRegions(data);
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
    if (!confirm(`Are you sure you want to delete "${region.name}" and all its projects?`)) return;

    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      const formDataObj = new FormData();
      formDataObj.append('id', region.id.toString());
      
      console.log('Deleting region:', region);
      const result = await deleteRegion(formDataObj);
      
      console.log('Delete result:', result);
      
      if (result.success) {
        setRegions(regions.filter(r => r.id !== region.id));
        console.log('Region deleted successfully, updated regions list');
      } else {
        setError(result.error || 'Failed to delete region');
        console.error('Delete failed:', result.error);
      }
    } catch (err) {
      setError('Failed to delete region');
      console.error('Delete region exception:', err);
    } finally {
      setLoading(false);
    }
  }, [regions]);

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

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
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
