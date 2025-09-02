'use client';

import React from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationAlert from './NotificationAlert';

export default function NotificationContainer() {
  const { notifications, removeNotification, clearNotifications } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.length > 1 && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500">
            {notifications.length} notification{notifications.length > 1 ? 's' : ''}
          </span>
          <button
            onClick={clearNotifications}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear all
          </button>
        </div>
      )}
      
      {notifications.map((notification) => (
        <NotificationAlert
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
}
