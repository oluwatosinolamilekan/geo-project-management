'use client';

import { Project, SidebarState } from '@/types';

interface ProjectsListProps {
  sidebarState: SidebarState;
  loading: boolean;
  error: string | null;
  onSidebarStateChange: (state: Partial<SidebarState>) => void;
  onProjectSelect: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
}

export default function ProjectsList({ 
  sidebarState, 
  loading, 
  error, 
  onSidebarStateChange, 
  onProjectSelect, 
  onDeleteProject 
}: ProjectsListProps) {
  return (
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
                    onClick={() => onDeleteProject(project)}
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
}
