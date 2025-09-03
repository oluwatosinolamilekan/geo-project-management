export interface Region {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  projects?: Project[];
}

export interface Project {
  id: number;
  region_id: number;
  name: string;
  geo_json: GeoJSONPolygon;
  created_at: string;
  updated_at: string;
  region?: Region;
  pins?: Pin[];
}

export interface Pin {
  id: number;
  project_id: number;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
  project?: Project;
}

export interface MapState {
  selectedRegion: Region | null;
  selectedProject: Project | null;
  selectedPin: Pin | null;
  drawingMode: 'project' | 'pin' | null;
  editMode: 'region' | 'project' | 'pin' | null;
  showProjectForm?: boolean; // New property to control form visibility
}

export interface SidebarState {
  isOpen: boolean;
  mode: 'regions' | 'projects' | 'create-region' | 'create-project' | 'view-project' | 'edit-region' | 'edit-project' | 'view-pin' | 'edit-pin' | 'create-pin';
  data: {
    region?: Region;
    project?: Project;
    pin?: Pin;
    geo_json?: GeoJSONPolygon;
  };
}

// GeoJSON type definitions
export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}
