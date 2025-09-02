'use server';

const API_BASE = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000';

console.log('API_BASE configured as:', API_BASE);

interface ServerActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

async function serverRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}/api${endpoint}`;
  
  console.log(`Making request to: ${url}`, { method: options.method || 'GET' });
  
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

export async function updateProject(formData: FormData): Promise<ServerActionResult> {
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
