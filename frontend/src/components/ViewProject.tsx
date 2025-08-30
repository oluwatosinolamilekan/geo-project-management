'use client';

import { Project, Pin, SidebarState } from '@/types';

interface ViewProjectProps {
  project: Project;
  onSidebarStateChange: (state: Partial<SidebarState>) => void;
  onDeleteProject: (project: Project) => void;
  onPinSelect: (pin: Pin) => void;
}

export default function ViewProject({ 
  project, 
  onSidebarStateChange, 
  onDeleteProject, 
  onPinSelect 
}: ViewProjectProps) {
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
            onClick={() => onDeleteProject(project)}
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
}
