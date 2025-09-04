'use client';

import { Project, Pin, SidebarState } from '@/types';
import { useRouter } from 'next/navigation';

interface ViewProjectProps {
  project: Project;
  onSidebarStateChange: (state: Partial<SidebarState>) => void;
  onEditPin: (pin: Pin) => void;
  onDeletePin: (pin: Pin) => void;
}

export default function ViewProject({ 
  project, 
  onSidebarStateChange, 
  onEditPin,
  onDeletePin
}: ViewProjectProps) {
  const router = useRouter();
  
  const handlePinDelete = async (pin: Pin) => {
    try {
      // First call the delete function
      await onDeletePin(pin);
      
      // After successful deletion, create a new project object with filtered pins
      const updatedProject = {
        ...project,
        pins: project.pins?.filter(p => p.id !== pin.id) || []
      };

      // Update the project in the sidebar state to trigger re-render
      onSidebarStateChange({
        mode: 'view-project',
        data: { 
          project: updatedProject,
          region: project.region // Preserve the region data
        }
      });
    } catch (error) {
      console.error('Failed to delete pin:', error);
      // You might want to show an error message to the user here
    }
  };
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
              <div
                key={pin.id}
                className="w-full bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md group"
              >
                <button
                  className="w-full flex justify-between items-center p-4 cursor-pointer hover:bg-blue-50 transition-all duration-200"
                  onClick={() => router.push(`/region/${project.region_id}/project/${project.id}/pin/${pin.id}`)}
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
                </button>
                <div className="border-t border-gray-100 px-4 py-3 flex justify-end space-x-2">
                  <button
                    onClick={() => onEditPin(pin)}
                    className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center space-x-1"
                    title="Edit Pin"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handlePinDelete(pin)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors flex items-center space-x-1"
                    title="Delete Pin"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
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
