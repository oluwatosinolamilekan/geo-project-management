'use client';

import { Project, SidebarState } from '@/types';

interface EditProjectFormProps {
  project: Project;
  formData: any;
  loading: boolean;
  onFormDataChange: (data: any) => void;
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
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Edit Project</h2>
      <p className="text-sm text-gray-500">Edit the polygon on the map if needed.</p>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Name
          </label>
          <input
            type="text"
            value={formData.name || project?.name || ''}
            onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
