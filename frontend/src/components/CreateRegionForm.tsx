'use client';

interface CreateRegionFormData {
  name: string;
}

interface CreateRegionFormProps {
  formData: CreateRegionFormData;
  loading: boolean;
  onFormDataChange: (data: CreateRegionFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function CreateRegionForm({ 
  formData, 
  loading, 
  onFormDataChange, 
  onSubmit, 
  onCancel 
}: CreateRegionFormProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Create Region</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Region Name
          </label>
          <input
            type="text"
            value={formData.name || ''}
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
            {loading ? 'Creating...' : 'Create Region'}
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
