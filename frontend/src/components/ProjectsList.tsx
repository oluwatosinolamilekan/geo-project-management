'use client';

import { Project, SidebarState, MapState } from '@/types';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import { useRouter } from 'next/navigation';

interface ProjectsListProps {
  sidebarState: SidebarState;
  loading: boolean;
  error: string | null;
  onSidebarStateChange: (state: Partial<SidebarState>) => void;
  onMapStateChange: (state: Partial<MapState>) => void;
  onProjectSelect: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
}

export default function ProjectsList({ 
  sidebarState, 
  loading, 
  error, 
  onSidebarStateChange,
  onMapStateChange, 
  onProjectSelect, 
  onDeleteProject 
}: ProjectsListProps) {
  const notificationActions = useNotificationActions();
  const { showLoading } = notificationActions || { showLoading: () => {} };
  const router = useRouter();

  const handleDeleteProject = (project: Project) => {
    // Show loading notification
    showLoading('Deleting', 'Project');
    
    // Call the original onDeleteProject
    onDeleteProject(project);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Projects</h2>
          <p className="text-sm font-semibold text-gray-900">{sidebarState.data.region?.name}</p>
        </div>
        <button
          onClick={() => {
            // Reset map state and start project creation
            onSidebarStateChange({ 
              mode: 'create-project', 
              data: { region: sidebarState.data.region } 
            });
            // Set map state to drawing mode and hide form
            onMapStateChange({ 
              drawingMode: 'project',
              showProjectForm: false 
            });
          }}
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
      ) : sidebarState.data.region && (!sidebarState.data.region.projects || sidebarState.data.region.projects.length === 0) ? (
        <div className="text-gray-700 text-center py-4 font-medium">No projects found. Create your first project!</div>
      ) : (
        <div className="space-y-2">
          {/* Sort projects by creation date, newest first */}
          {sidebarState.data.region?.projects?.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ).map((project: Project) => (
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
                    onClick={() => handleDeleteProject(project)}
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
        onClick={() => router.push('/')}
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
