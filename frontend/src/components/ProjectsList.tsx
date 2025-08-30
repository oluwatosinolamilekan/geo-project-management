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
          <h2 className="text-xl font-bold text-gray-900">Projects</h2>
          <p className="text-sm font-semibold text-gray-900">{sidebarState.data.region?.name}</p>
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
        <div className="text-center py-4 text-gray-900 font-medium">Loading...</div>
      ) : error ? (
        <div className="text-red-600 text-sm font-medium">{error}</div>
      ) : !sidebarState.data.region?.projects || sidebarState.data.region.projects.length === 0 ? (
        <div className="text-gray-700 text-center py-4 font-medium">No projects found. Create your first project!</div>
      ) : (
        <div className="space-y-2">
          {sidebarState.data.region.projects?.map((project: any) => (
            <div key={project.id} className="border rounded p-3 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => onProjectSelect(project)}
                  className="text-left flex-1 hover:text-blue-600"
                >
                  <h3 className="font-bold text-gray-900 text-lg">{project.name}</h3>
                  <p className="text-sm text-gray-800 font-medium">
                    {project.pins?.length || 0} pins
                  </p>
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onSidebarStateChange({ 
                      mode: 'edit-project', 
                      data: { project } 
                    })}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteProject(project)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
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
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Regions</span>
      </button>
    </div>
  );
}
