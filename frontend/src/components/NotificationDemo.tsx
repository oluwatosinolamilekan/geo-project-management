'use client';

import { useNotificationActions } from '@/hooks/useNotificationActions';

export default function NotificationDemo() {
  const {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showCreateSuccess,
    showCreateError,
    showUpdateSuccess,
    showUpdateError,
    showDeleteSuccess,
    showDeleteError,
  } = useNotificationActions();

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Notification System Demo</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-800">Basic Notifications</h3>
          <button
            onClick={() => showSuccess('Success!', 'This is a success message')}
            className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
          >
            Show Success
          </button>
          <button
            onClick={() => showError('Error!', 'This is an error message')}
            className="w-full bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
          >
            Show Error
          </button>
          <button
            onClick={() => showWarning('Warning!', 'This is a warning message')}
            className="w-full bg-yellow-500 text-white px-3 py-2 rounded text-sm hover:bg-yellow-600"
          >
            Show Warning
          </button>
          <button
            onClick={() => showInfo('Info!', 'This is an info message')}
            className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
          >
            Show Info
          </button>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-800">CRUD Notifications</h3>
          <button
            onClick={() => showCreateSuccess('Region')}
            className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
          >
            Create Success
          </button>
          <button
            onClick={() => showCreateError('Region', 'Network timeout')}
            className="w-full bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
          >
            Create Error
          </button>
          <button
            onClick={() => showUpdateSuccess('Project')}
            className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
          >
            Update Success
          </button>
          <button
            onClick={() => showUpdateError('Project', 'Validation failed')}
            className="w-full bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
          >
            Update Error
          </button>
          <button
            onClick={() => showDeleteSuccess('Pin')}
            className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
          >
            Delete Success
          </button>
          <button
            onClick={() => showDeleteError('Pin', 'Permission denied')}
            className="w-full bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
          >
            Delete Error
          </button>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">How to Use:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Import <code className="bg-gray-200 px-1 rounded">useNotificationActions</code> hook</li>
          <li>• Use <code className="bg-gray-200 px-1 rounded">showLoading()</code> before API calls</li>
          <li>• Use success/error notifications after API responses</li>
          <li>• Notifications auto-dismiss after configured duration</li>
          <li>• Users can manually dismiss notifications</li>
        </ul>
      </div>
    </div>
  );
}
