'use client';

import { Project, GeoJSONPolygon } from '@/types';
import { useNotificationActions } from '@/hooks/useNotificationActions';

interface EditProjectFormData {
  name: string;
  geo_json?: GeoJSONPolygon;
}

interface EditProjectFormProps {
  project: Project;
  formData: EditProjectFormData;
  loading: boolean;
  onFormDataChange: (data: EditProjectFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function EditProjectForm({ 
  project,
  formData, 
  loading, 
  onFormDataChange, 
  onSubmit, 
  onCancel 
}: EditProjectFormProps) {
  const notificationActions = useNotificationActions();
  const { showLoading } = notificationActions || { showLoading: () => {} };

  const handleSubmit = (e: React.FormEvent) => {
    if (loading) return;
    
    // Show loading notification
    showLoading('Updating', 'Project');
    
    // Call the original onSubmit
    onSubmit(e);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Edit Project</h2>
      <p className="text-sm text-gray-900">Edit the polygon on the map if needed.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-base font-semibold text-gray-900 mb-2">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name || project?.name || ''}
            onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            required
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Project'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
