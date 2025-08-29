'use client';

import { useState, useEffect } from 'react';
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
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Load regions on mount
  useEffect(() => {
    loadRegions();
  }, []);

  // Handle pin image loading
  useEffect(() => {
    if (sidebarState.mode === 'view-pin' && sidebarState.data?.pin) {
      // Generate a random image URL for each pin view
      const randomId = Math.floor(Math.random() * 1000);
      const timestamp = Date.now();
      setImageLoading(true);
      setImageError(false);
      setImageUrl(`https://picsum.photos/300/200?random=${randomId}&t=${timestamp}`);
    }
  }, [sidebarState.mode, sidebarState.data?.pin?.id]);

  const loadRegions = async () => {
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
  };

  const handleCreateRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    try {
      setLoading(true);
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name.trim());
      
      const result = await createRegion(formDataObj);
      
      if (result.success) {
        setRegions([...regions, result.data]);
        setFormData({});
        onSidebarStateChange({ mode: 'regions', data: null });
      } else {
        setError(result.error || 'Failed to create region');
      }
    } catch (err) {
      setError('Failed to create region');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.geo_json) return;

    try {
      setLoading(true);
      const formDataObj = new FormData();
      formDataObj.append('regionId', sidebarState.data.regionId.toString());
      formDataObj.append('name', formData.name.trim());
      formDataObj.append('geoJson', JSON.stringify(formData.geo_json));
      
      const result = await createProject(formDataObj);
      
      if (result.success) {
        setFormData({});
        onSidebarStateChange({ mode: 'projects', data: { region: sidebarState.data.region } });
        // Refresh the region data to include the new project
        onRegionSelect(sidebarState.data.region);
      } else {
        setError(result.error || 'Failed to create project');
      }
    } catch (err) {
      setError('Failed to create project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !sidebarState.data.region?.id) return;

    try {
      setLoading(true);
      const formDataObj = new FormData();
      formDataObj.append('id', sidebarState.data.region.id.toString());
      formDataObj.append('name', formData.name.trim());
      
      const result = await updateRegion(formDataObj);
      
      if (result.success) {
        setRegions(regions.map(r => r.id === sidebarState.data.region.id ? { ...r, name: formData.name.trim() } : r));
        setFormData({});
        onSidebarStateChange({ mode: 'regions', data: null });
      } else {
        setError(result.error || 'Failed to update region');
      }
    } catch (err) {
      setError('Failed to update region');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !sidebarState.data.project?.id) return;

    try {
      setLoading(true);
      const formDataObj = new FormData();
      formDataObj.append('id', sidebarState.data.project.id.toString());
      formDataObj.append('name', formData.name.trim());
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
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
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
        onPinSelect(sidebarState.data.pin);
      } else {
        setError(result.error || 'Failed to update pin');
      }
    } catch (err) {
      setError('Failed to update pin');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRegion = async (region: Region) => {
    if (!confirm(`Are you sure you want to delete "${region.name}" and all its projects?`)) return;

    try {
      setLoading(true);
      const formDataObj = new FormData();
      formDataObj.append('id', region.id.toString());
      
      const result = await deleteRegion(formDataObj);
      
      if (result.success) {
        setRegions(regions.filter(r => r.id !== region.id));
      } else {
        setError(result.error || 'Failed to delete region');
      }
    } catch (err) {
      setError('Failed to delete region');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (project: Project) => {
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
  };

  const handleDeletePin = async (pin: Pin) => {
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
  };

  const renderRegionsList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Regions</h2>
        <button
          onClick={() => onSidebarStateChange({ mode: 'create-region', data: null })}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
        >
          Add Region
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-sm">{error}</div>
      ) : !regions || regions.length === 0 ? (
        <div className="text-gray-500 text-center py-4">No regions found. Create your first region!</div>
      ) : (
        <div className="space-y-2">
          {regions.map(region => (
            <div key={region.id} className="border rounded p-3 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => onRegionSelect(region)}
                  className="text-left flex-1 hover:text-blue-600"
                >
                  <h3 className="font-semibold text-gray-800 text-lg">{region.name}</h3>
                  <p className="text-sm text-gray-600">
                    {region.projects?.length || 0} projects
                  </p>
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onSidebarStateChange({ 
                      mode: 'edit-region', 
                      data: { region } 
                    })}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRegion(region)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProjectsList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Projects</h2>
          <p className="text-sm font-medium text-gray-700">{sidebarState.data.region?.name}</p>
        </div>
        <button
          onClick={() => onSidebarStateChange({ 
            mode: 'create-project', 
            data: { region: sidebarState.data.region, regionId: sidebarState.data.region?.id } 
          })}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
          disabled={!sidebarState.data.region}
        >
          Add Project
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-sm">{error}</div>
      ) : !sidebarState.data.region?.projects || sidebarState.data.region.projects.length === 0 ? (
        <div className="text-gray-500 text-center py-4">No projects found. Create your first project!</div>
      ) : (
        <div className="space-y-2">
          {sidebarState.data.region.projects?.map((project: any) => (
            <div key={project.id} className="border rounded p-3 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => onProjectSelect(project)}
                  className="text-left flex-1 hover:text-blue-600"
                >
                  <h3 className="font-semibold text-gray-800 text-lg">{project.name}</h3>
                  <p className="text-sm text-gray-600">
                    {project.pins?.length || 0} pins
                  </p>
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onSidebarStateChange({ 
                      mode: 'edit-project', 
                      data: { project } 
                    })}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <button
        onClick={() => onSidebarStateChange({ mode: 'regions', data: null })}
        className="text-blue-500 hover:text-blue-700 text-sm"
      >
        ← Back to Regions
      </button>
    </div>
  );

  const renderCreateRegionForm = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Create Region</h2>
      <form onSubmit={handleCreateRegion} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Region Name
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter region name"
            required
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Region'}
          </button>
          <button
            type="button"
            onClick={() => onSidebarStateChange({ mode: 'regions', data: null })}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  const renderCreateProjectForm = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Create Project</h2>
      <p className="text-sm text-gray-500">Draw a polygon on the map, then enter the project name.</p>
      
      <form onSubmit={handleCreateProject} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Name
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter project name"
            required
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={loading || !formData.geo_json}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
          <button
            type="button"
            onClick={() => onSidebarStateChange({ mode: 'projects', data: { region: sidebarState.data.region } })}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  const renderViewProject = () => {
    const project = sidebarState.data.project;
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
            <p className="text-sm text-gray-500">Project Details</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onSidebarStateChange({ 
                mode: 'edit-project', 
                data: { project } 
              })}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteProject(project)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
        
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-800"><strong className="text-gray-900">Region:</strong> <span className="font-medium">{project.region?.name}</span></p>
          <p className="text-gray-800"><strong className="text-gray-900">Pins:</strong> <span className="font-medium">{project.pins?.length || 0}</span></p>
          <p className="text-gray-800"><strong className="text-gray-900">Created:</strong> <span className="font-medium">{new Date(project.created_at).toLocaleDateString()}</span></p>
        </div>
        
        {/* Add Pin Button */}
        <button
          onClick={() => {
            // Trigger pin creation mode in the map
            const event = new CustomEvent('startPinCreation');
            window.dispatchEvent(event);
          }}
          className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add Pin
        </button>
        
        {/* Pins List */}
        {project.pins && project.pins.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-gray-700">Pins in this project:</h3>
            <div className="space-y-1">
              {project.pins.map((pin: Pin) => (
                <div
                  key={pin.id}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => onPinSelect(pin)}
                >
                  <span className="text-sm font-medium text-gray-800">Pin #{pin.id}</span>
                  <span className="text-xs text-gray-600">
                    {pin.latitude ? Number(pin.latitude).toFixed(4) : 'N/A'}, {pin.longitude ? Number(pin.longitude).toFixed(4) : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <button
          onClick={() => onSidebarStateChange({ mode: 'projects', data: { region: project.region } })}
          className="text-blue-500 hover:text-blue-700 text-sm"
        >
          ← Back to Projects
        </button>
      </div>
    );
  };

  const renderViewPin = () => {
    const pin = sidebarState.data.pin;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">Pin #{pin.id}</h2>
            <p className="text-sm text-gray-500">Pin Details</p>
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
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeletePin(pin)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <p><strong>Project:</strong> {pin.project?.name}</p>
          <p><strong>Latitude:</strong> {pin.latitude ? Number(pin.latitude).toFixed(6) : 'N/A'}</p>
          <p><strong>Longitude:</strong> {pin.longitude ? Number(pin.longitude).toFixed(6) : 'N/A'}</p>
          <p><strong>Created:</strong> {new Date(pin.created_at).toLocaleDateString()}</p>
        </div>
        
        <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center">
          {imageLoading && (
            <div className="text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm">Loading image...</p>
            </div>
          )}
          {imageError && (
            <div className="text-gray-500 text-center">
              <p className="text-sm">Failed to load image</p>
              <button 
                onClick={() => {
                  const randomId = Math.floor(Math.random() * 1000);
                  const timestamp = Date.now();
                  setImageLoading(true);
                  setImageError(false);
                  setImageUrl(`https://picsum.photos/300/200?random=${randomId}&t=${timestamp}`);
                }}
                className="text-blue-500 hover:text-blue-700 text-sm mt-1"
              >
                Retry
              </button>
            </div>
          )}
          {imageUrl && !imageLoading && !imageError && (
            <img 
              src={imageUrl} 
              alt="Pin location" 
              className="w-full h-48 object-cover rounded"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
          )}
        </div>
        
        <button
          onClick={() => onSidebarStateChange({ 
            mode: 'view-project', 
            data: { project: pin.project } 
          })}
          className="text-blue-500 hover:text-blue-700 text-sm"
        >
          ← Back to Project
        </button>
      </div>
    );
  };

  const renderEditForms = () => {
    switch (sidebarState.mode) {
      case 'edit-region':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Edit Region</h2>
            <form onSubmit={handleUpdateRegion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region Name
                </label>
                <input
                  type="text"
                  value={formData.name || sidebarState.data.region?.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Region'}
                </button>
                <button
                  type="button"
                  onClick={() => onSidebarStateChange({ mode: 'regions', data: null })}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        );

      case 'edit-project':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Edit Project</h2>
            <p className="text-sm text-gray-500">Edit the polygon on the map if needed.</p>
            
            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name || sidebarState.data.project?.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Project'}
                </button>
                <button
                  type="button"
                  onClick={() => onSidebarStateChange({ 
                    mode: 'view-project', 
                    data: { project: sidebarState.data.project } 
                  })}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        );

      case 'edit-pin':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Edit Pin</h2>
            <p className="text-sm text-gray-500">Drag the pin on the map to update coordinates.</p>
            
            <form onSubmit={handleUpdatePin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude || mapState.selectedPin?.latitude || sidebarState.data.pin?.latitude || ''}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude || mapState.selectedPin?.longitude || sidebarState.data.pin?.longitude || ''}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Exit edit mode
                    const event = new CustomEvent('exitPinEdit');
                    window.dispatchEvent(event);
                    onSidebarStateChange({ 
                      mode: 'view-pin', 
                      data: { pin: sidebarState.data.pin } 
                    });
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  if (!sidebarState.isOpen) return null;

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {sidebarState.mode === 'regions' && renderRegionsList()}
      {sidebarState.mode === 'projects' && renderProjectsList()}
      {sidebarState.mode === 'create-region' && renderCreateRegionForm()}
      {sidebarState.mode === 'create-project' && renderCreateProjectForm()}
      {sidebarState.mode === 'view-project' && renderViewProject()}
      {sidebarState.mode === 'view-pin' && renderViewPin()}
      {(sidebarState.mode === 'edit-region' || sidebarState.mode === 'edit-project' || sidebarState.mode === 'edit-pin') && renderEditForms()}
    </div>
  );
}
