'use client';

import { Region } from '@/types';
import { useNotificationActions } from '@/hooks/useNotificationActions';

interface EditRegionFormData {
  name: string;
}

interface EditRegionFormProps {
  region: Region;
  formData: EditRegionFormData;
  loading: boolean;
  onFormDataChange: (data: EditRegionFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function EditRegionForm({ 
  region,
  formData, 
  loading, 
  onFormDataChange, 
  onSubmit, 
  onCancel 
}: EditRegionFormProps) {
  const { showLoading } = useNotificationActions();

  const handleSubmit = (e: React.FormEvent) => {
    if (loading) return;
    
    // Show loading notification
    showLoading('Updating', 'Region');
    
    // Call the original onSubmit
    onSubmit(e);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Edit Region</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Region Name
          </label>
          <input
            type="text"
            value={formData.name || region?.name || ''}
            onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter region name"
            required
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Region'}
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
