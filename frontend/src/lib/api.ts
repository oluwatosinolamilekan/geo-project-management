const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}/api${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Regions API - Read operations only
export const regionsApi = {
  getAll: async () => {
    const response = await apiRequest('/regions');
    return response.data || response;
  },
  getById: async (id: number) => {
    const response = await apiRequest(`/regions/${id}`);
    return response.data || response;
  },
};

// Projects API - Read operations only
export const projectsApi = {
  getByRegion: async (regionId: number) => {
    const response = await apiRequest(`/regions/${regionId}/projects`);
    return response.data || response;
  },
  getById: async (id: number) => {
    const response = await apiRequest(`/projects/${id}`);
    return response.data || response;
  },
};

// Pins API - Read operations only
export const pinsApi = {
  getByProject: async (projectId: number) => {
    const response = await apiRequest(`/projects/${projectId}/pins`);
    return response.data || response;
  },
  getById: async (id: number) => {
    const response = await apiRequest(`/pins/${id}`);
    return response.data || response;
  },
};
