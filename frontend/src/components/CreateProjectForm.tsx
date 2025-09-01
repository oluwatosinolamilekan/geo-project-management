'use client';

import { GeoJSONPolygon } from '@/types';

interface CreateProjectFormData {
  name: string;
  geo_json?: GeoJSONPolygon;
}

interface CreateProjectFormProps {
  formData: CreateProjectFormData;
  loading: boolean;
  onFormDataChange: (data: CreateProjectFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function CreateProjectForm({ 
  formData, 
  loading, 
  onFormDataChange, 
  onSubmit, 
  onCancel 
}: CreateProjectFormProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Create Project</h2>
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">📍 How to Draw Your Project Area:</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Click on the map to place your first point</li>
          <li>Continue clicking to add more points around your area</li>
          <li>Double-click the last point to complete the polygon</li>
          <li>Enter your project name below</li>
        </ol>
        {!formData.geo_json && (
          <p className="text-xs text-blue-600 mt-2 font-medium">
            ⚠️ You need to draw a polygon on the map first
          </p>
        )}
        {formData.geo_json && (
          <p className="text-xs text-green-700 mt-2 font-medium flex items-center">
            ✅ Polygon drawn! Now enter the project name.
          </p>
        )}
      </div>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Project Name
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter project name"
            required
          />
        </div>
        
        <div className="space-y-3">
          {!formData.geo_json && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800 font-medium">
                 Start by drawing a polygon on the map to define your project area
              </p>
            </div>
          )}
          
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading || !formData.geo_json}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
          
          {formData.geo_json && (
            <p className="text-xs text-green-700 text-center">
              ✅ Ready to create! Enter a name above and click &quot;Create Project&quot;
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
