'use server';

import { Region, Project, Pin } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://127.0.0.1:8000';

console.log('API_BASE configured as:', API_BASE);

interface ServerActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Type-specific results
type RegionResult = ServerActionResult<Region>;
type RegionsResult = ServerActionResult<Region[]>;
type ProjectResult = ServerActionResult<Project>;
type ProjectsResult = ServerActionResult<Project[]>;
type PinResult = ServerActionResult<Pin>;
type PinsResult = ServerActionResult<Pin[]>;

// Combined project details result
interface ProjectDetails {
  project: Project;
  region: Region;
}
type ProjectDetailsResult = ServerActionResult<ProjectDetails>;

// Combined pin details result
interface PinDetails {
  pin: Pin;
  project: Project;
  region: Region;
  pins: Pin[];
}
type PinDetailsResult = ServerActionResult<PinDetails>;

// Combined region details result
interface RegionDetails {
  region: Region;
  projects: Project[];
}
type RegionDetailsResult = ServerActionResult<RegionDetails>;

async function serverRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}/api${endpoint}`;
  
  console.log(`Making request to: ${url}`, { method: options.method || 'GET' });
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

  console.log(`Response status: ${response.status} for ${url}`);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
    }
    console.error('API Error:', errorData);
    throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
  }

  // For DELETE requests, the response might be empty or just a message
  if (options.method === 'DELETE') {
    try {
      const data = await response.json();
      return data;
    } catch {
      // If no JSON response, return a success message
      return { message: 'Success' };
    }
  }

  return response.json();
  } catch (error) {
    console.error('Network error during fetch:', error);
    throw new Error('fetch failed');
  }
}

// Region Read Actions
export async function getAllRegions(): Promise<RegionsResult> {
  console.log('Get all regions called');
  try {
    const response = await serverRequest('/regions');
    return { success: true, data: response.data || response };
  } catch (error) {
    console.error('Get all regions error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get regions' 
    };
  }
}

export async function getRegionById(id: number, location?: string) {
  console.log('Get region by id called with id:', id, 'and location:', location);
  try {
    const response = await serverRequest(`/regions/${id}`);
    return { success: true, data: response.data || response };
  } catch (error) {
    console.error('Get region by id error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get region' 
    };
  }
}

export async function getRegionDetails(regionId: number): Promise<RegionDetailsResult> {
  try {
    console.log('Getting region details for region ID:', regionId);
    const response = await serverRequest(`/regions/${regionId}/details`);
    return { success: true, data: response.data || response };
  } catch (error) {
    console.error('Get region details error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get region details' 
    };
  }
}

// Region Server Actions
export async function createRegion(formData: FormData): Promise<ServerActionResult> {
  try {
    const name = formData.get('name') as string;
    
    if (!name?.trim()) {
      throw new Error('Region name is required');
    }

    const response = await serverRequest('/regions', {
      method: 'POST',
      body: JSON.stringify({ name: name.trim() }),
    });

    return { success: true, data: response.data || response };
  } catch (error) {
    console.error('Create region error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create region' 
    };
  }
}

export async function updateRegion(formData: FormData): Promise<ServerActionResult> {
  try {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    
    if (!id || !name?.trim()) {
      throw new Error('Region ID and name are required');
    }

    const response = await serverRequest(`/regions/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: name.trim() }),
    });

    return { success: true, data: response.data || response };
  } catch (error) {
    console.error('Update region error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update region' 
    };
  }
}

export async function deleteRegion(formData: FormData): Promise<ServerActionResult> {
  try {
    const id = formData.get('id') as string;
    
    console.log('Attempting to delete region with ID:', id);
    
    if (!id) {
      throw new Error('Region ID is required');
    }

    const response = await serverRequest(`/regions/${id}`, {
      method: 'DELETE',
    });

    console.log('Delete region response:', response);

    return { success: true };
  } catch (error) {
    console.error('Delete region error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete region' 
    };
  }
}

// Project Read Actions
export async function getProjectsByRegion(regionId: number): Promise<ProjectsResult> {
  try {
    const response = await serverRequest(`/regions/${regionId}/projects`);
    return { success: true, data: response.data || response };
  } catch (error) {
    console.error('Get projects by region error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get projects' 
    };
  }
}

export async function getProjectById(id: number): Promise<ProjectResult> {
  try {
    const response = await serverRequest(`/projects/${id}`);

    return { success: true, data: response.data || response };
  } catch (error) {
    console.error('Get project by id error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get project' 
    };
  }
}

export async function getProjectDetails(projectId: number): Promise<ProjectDetailsResult> {
  try {
    console.log('Getting project details for project ID:', projectId);
    const response = await serverRequest(`/projects/${projectId}/details`);
    return { success: true, data: response.data || response };
  } catch (error) {
    console.error('Get project details error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get project details' 
    };
  }
}

// Project Server Actions
export async function createProject(formData: FormData): Promise<ServerActionResult> {
  try {
    const regionId = formData.get('regionId') as string;
    const name = formData.get('name') as string;
    const geoJson = formData.get('geoJson') as string;
    
    if (!regionId || !name?.trim() || !geoJson) {
      throw new Error('Region ID, name, and geo JSON are required');
    }

    const geoJsonData = JSON.parse(geoJson);

    const response = await serverRequest(`/regions/${regionId}/projects`, {
      method: 'POST',
      body: JSON.stringify({ 
        name: name.trim(), 
        geo_json: geoJsonData 
      }),
    });

    return { success: true, data: response.data || response };
  } catch (error) {
    console.error('Create project error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create project' 
    };
  }
}

// Combined project update result with all related data
interface ProjectUpdateResult {
  project: Project;
  region: Region;
  projects: Project[];
}
type ProjectUpdateResponse = ServerActionResult<ProjectUpdateResult>;

export async function updateProject(formData: FormData): Promise<ProjectUpdateResponse> {
  try {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const geoJson = formData.get('geoJson') as string;
    
    if (!id) {
      throw new Error('Project ID is required');
    }

    const updateData: Record<string, unknown> = {};
    if (name?.trim()) updateData.name = name.trim();
    if (geoJson) updateData.geo_json = JSON.parse(geoJson);

    const response = await serverRequest(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    return { success: true, data: response.data || response };
  } catch (error) {
    console.error('Update project error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update project' 
    };
  }
}

export async function deleteProject(formData: FormData): Promise<ServerActionResult> {
  try {
    const id = formData.get('id') as string;
    
    if (!id) {
      throw new Error('Project ID is required');
    }

    await serverRequest(`/projects/${id}`, {
      method: 'DELETE',
    });

    return { success: true };
  } catch (error) {
    console.error('Delete project error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete project' 
    };
  }
}

// Pin Read Actions
export async function getPinsByProject(projectId: number): Promise<PinsResult> {
  try {
    const response = await serverRequest(`/projects/${projectId}/pins`);
    return { success: true, data: response.data || response };
  } catch (error) {
    console.error('Get pins by project error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get pins' 
    };
  }
}

export async function getPinById(id: number): Promise<PinResult> {
  try {
    const response = await serverRequest(`/pins/${id}`);
    return { success: true, data: response.data || response };
  } catch (error) {
    console.error('Get pin by id error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get pin' 
    };
  }
}

export async function getPinDetails(pinId: number): Promise<PinDetailsResult> {
  try {
    console.log('Getting pin details for pin ID:', pinId);
    const response = await serverRequest(`/pins/${pinId}/details`);
    return { success: true, data: response.data || response };
  } catch (error) {
    console.error('Get pin details error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get pin details' 
    };
  }
}

// Pin Server Actions
export async function createPin(formData: FormData): Promise<ServerActionResult> {
  try {
    const projectId = formData.get('projectId') as string;
    const latitude = formData.get('latitude') as string;
    const longitude = formData.get('longitude') as string;
    
    if (!projectId || !latitude || !longitude) {
      throw new Error('Project ID, latitude, and longitude are required');
    }

    const response = await serverRequest(`/projects/${projectId}/pins`, {
      method: 'POST',
      body: JSON.stringify({ 
        latitude: parseFloat(latitude), 
        longitude: parseFloat(longitude) 
      }),
    });

    return { success: true, data: response.data || response };
  } catch (error) {
    console.error('Create pin error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create pin' 
    };
  }
}

export async function updatePin(formData: FormData): Promise<ServerActionResult> {
  try {
    const id = formData.get('id') as string;
    const latitude = formData.get('latitude') as string;
    const longitude = formData.get('longitude') as string;
    
    if (!id || !latitude || !longitude) {
      throw new Error('Pin ID, latitude, and longitude are required');
    }

    const response = await serverRequest(`/pins/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ 
        latitude: parseFloat(latitude), 
        longitude: parseFloat(longitude) 
      }),
    });

    return { success: true, data: response.data || response };
  } catch (error) {
    console.error('Update pin error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update pin' 
    };
  }
}

export async function deletePin(formData: FormData): Promise<ServerActionResult> {
  try {
    const id = formData.get('id') as string;
    
    if (!id) {
      throw new Error('Pin ID is required');
    }

    await serverRequest(`/pins/${id}`, {
      method: 'DELETE',
    });

    return { success: true };
  } catch (error) {
    console.error('Delete pin error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete pin' 
    };
  }
}
