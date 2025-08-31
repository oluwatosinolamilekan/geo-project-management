'use client';

import { Pin, MapState } from '@/types';

interface EditPinFormData {
  latitude: number;
  longitude: number;
}

interface EditPinFormProps {
  pin: Pin;
  mapState: MapState;
  formData: EditPinFormData;
  loading: boolean;
  onFormDataChange: (data: EditPinFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function EditPinForm({ 
  pin,
  mapState,
  formData, 
  loading, 
  onFormDataChange, 
  onSubmit, 
  onCancel 
}: EditPinFormProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Edit Pin</h2>
      <p className="text-sm text-gray-500">Drag the pin on the map to update coordinates.</p>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Latitude
          </label>
          <input
            type="number"
            step="any"
            value={formData.latitude || mapState.selectedPin?.latitude || pin?.latitude || ''}
            onChange={(e) => onFormDataChange({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Longitude
          </label>
          <input
            type="number"
            step="any"
            value={formData.longitude || mapState.selectedPin?.longitude || pin?.longitude || ''}
            onChange={(e) => onFormDataChange({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Save Changes'}
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
