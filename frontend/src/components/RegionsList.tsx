'use client';

import { Region, SidebarState } from '@/types';
import { useNotificationActions } from '@/hooks/useNotificationActions';

interface RegionsListProps {
  regions: Region[];
  loading: boolean;
  error: string | null;
  onSidebarStateChange: (state: Partial<SidebarState>) => void;
  onRegionSelect: (region: Region) => void;
  onDeleteRegion: (region: Region) => void;
}

export default function RegionsList({ 
  regions, 
  loading, 
  error, 
  onSidebarStateChange, 
  onRegionSelect, 
  onDeleteRegion 
}: RegionsListProps) {
  const notificationActions = useNotificationActions();
  const { showLoading } = notificationActions || { showLoading: () => {} };

  const handleDeleteRegion = (region: Region) => {
    // Show loading notification
    showLoading('Deleting', 'Region');
    
    // Call the original onDeleteRegion
    onDeleteRegion(region);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Regions</h2>
        <button
          onClick={() => onSidebarStateChange({ mode: 'create-region', data: {} })}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
        >
          Add Region
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-sm">{error}</div>
      ) : !regions || regions.length === 0 ? (
        <div className="text-gray-500 text-center py-4">No regions found. Create your first region!</div>
      ) : (
        <div className="space-y-2">
          {regions.map(region => (
            <div key={region.id} className="border rounded p-3 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => onRegionSelect(region)}
                  className="text-left flex-1 hover:text-blue-600"
                >
                  <h3 className="font-semibold text-gray-800 text-lg">{region.name}</h3>
                  <p className="text-sm text-gray-600">
                    {region.projects?.length || 0} projects
                  </p>
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onSidebarStateChange({ 
                      mode: 'edit-region', 
                      data: { region } 
                    })}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRegion(region)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
