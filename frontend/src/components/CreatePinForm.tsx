'use client';

import { Project, Pin } from '@/types';
import { useRouter } from 'next/navigation';
import { useNotificationActions } from '@/hooks/useNotificationActions';

interface CreatePinFormProps {
  project: Project;
  latitude: number;
  longitude: number;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function CreatePinForm({ 
  project,
  latitude,
  longitude,
  loading,
  onSubmit,
  onCancel
}: CreatePinFormProps) {
  const router = useRouter();
  const { showLoading } = useNotificationActions();

  const handleSubmit = (e: React.FormEvent) => {
    if (loading) return;
    
    // Show loading notification
    showLoading('Creating', 'Pin');
    
    // Call the original onSubmit
    onSubmit(e);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Create New Pin</h2>
      <p className="text-sm text-gray-500">Adding pin to project: {project.name}</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Latitude
          </label>
          <input
            type="number"
            step="any"
            value={latitude}
            readOnly
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Longitude
          </label>
          <input
            type="number"
            step="any"
            value={longitude}
            readOnly
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500"
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
          >
            {loading ? 'Creating...' : 'Create Pin'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/region/${project.region_id}/project/${project.id}`)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
