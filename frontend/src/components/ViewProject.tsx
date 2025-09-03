'use client';

import { Project, Pin, SidebarState } from '@/types';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
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
          // Navigate to pin creation page
          router.push(`/region/${project.region_id}/project/${project.id}/add-pin`);
        }}
        className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Add Pin
      </button>
      
      {/* Pins List */}
      {project.pins && project.pins.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 text-base"> Pins in this project:</h3>
          <div className="space-y-2">
            {project.pins.map((pin: Pin) => (
              <button
                key={pin.id}
                className="w-full flex justify-between items-center p-4 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md group"
                onClick={() => onPinSelect(pin)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Pin #{pin.id}</div>
                    <div className="text-xs text-gray-500">Click to view details</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-gray-700 group-hover:text-blue-600 transition-colors">
                    {pin.latitude ? Number(pin.latitude).toFixed(4) : 'N/A'}, {pin.longitude ? Number(pin.longitude).toFixed(4) : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors">
                    Coordinates
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
      
      <button
        onClick={() => router.push(`/region/${project.region_id}`)}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Projects</span>
      </button>
    </div>
  );
}
