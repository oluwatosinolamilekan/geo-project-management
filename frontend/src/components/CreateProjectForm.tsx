'use client';

import { GeoJSONPolygon } from '@/types';
import { useNotificationActions } from '@/hooks/useNotificationActions';

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
  const { showLoading } = useNotificationActions();

  const handleSubmit = (e: React.FormEvent) => {
    if (loading) return;
    
    // Show loading notification
    showLoading('Creating', 'Project');
    
    // Call the original onSubmit
    onSubmit(e);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Create Project</h2>
      
      {/* Detailed polygon drawing guide */}
      <div className={`p-4 rounded-lg border-2 ${formData.geo_json ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <h3 className="text-base font-semibold text-blue-900">How to Draw Your Project Area</h3>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded-full text-blue-600 font-bold">1</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Start Drawing</h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc pl-4">
                  <li>Click on the map to place your first point</li>
                  <li>This will be one corner of your project area</li>
                  <li>You can zoom in/out using the buttons or mouse wheel</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded-full text-blue-600 font-bold">2</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Create the Boundary</h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc pl-4">
                  <li>Continue clicking to add more points</li>
                  <li>Each click creates a corner of your project area</li>
                  <li>A line will automatically connect your points</li>
                  <li>Make sure to surround your entire project area</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded-full text-blue-600 font-bold">3</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Complete the Polygon</h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc pl-4">
                  <li><strong>Double-click</strong> on your last point to finish</li>
                  <li>The area will be highlighted when complete</li>
                  <li>If you make a mistake, click the trash icon in the top right of the map to start over</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded-full text-blue-600 font-bold">4</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Name Your Project</h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc pl-4">
                  <li>Enter a name for your project in the field below</li>
                  <li>Click "Create Project" to save</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {formData.geo_json ? (
          <div className="mt-4 bg-green-100 p-3 rounded-lg flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="text-sm text-green-700 font-medium">
                Polygon drawn successfully!
              </p>
              <p className="text-xs text-green-600">
                Enter a name below to complete your project creation
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 bg-yellow-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-yellow-700 font-medium">
                Start by drawing your project boundary on the map
              </p>
            </div>
            <p className="text-xs text-yellow-600 ml-7">
              Need help? Follow the step-by-step guide above
            </p>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-base font-semibold text-gray-900 mb-2">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
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
