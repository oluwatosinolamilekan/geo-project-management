# Notification System

A comprehensive notification system for the frontend that provides user feedback for all CRUD operations and other important actions.

## Features

- **Multiple notification types**: Success, Error, Warning, Info
- **Auto-dismiss**: Notifications automatically disappear after configurable durations
- **Manual dismissal**: Users can manually close notifications
- **CRUD operation support**: Pre-built notifications for Create, Read, Update, Delete operations
- **Loading states**: Show loading notifications during API calls
- **Responsive design**: Notifications appear in the top-right corner with proper spacing
- **Accessibility**: Proper ARIA labels and keyboard navigation support

## Components

### 1. NotificationProvider
The context provider that manages notification state globally.

**Location**: `src/contexts/NotificationContext.tsx`

**Usage**: Wrap your app with this provider in the root layout.

### 2. NotificationContainer
Displays all active notifications in the top-right corner.

**Location**: `src/components/NotificationContainer.tsx`

**Features**:
- Fixed positioning with high z-index
- Clear all notifications button
- Notification count display
- Responsive design

### 3. NotificationAlert
Individual notification component with different styles based on type.

**Location**: `src/components/NotificationAlert.tsx`

**Features**:
- Type-based styling (success, error, warning, info)
- Icons for each notification type
- Close button
- Responsive layout

## Hooks

### useNotifications
Basic hook for direct notification management.

```typescript
import { useNotifications } from '@/contexts/NotificationContext';

const { addNotification, removeNotification, clearNotifications } = useNotifications();

addNotification({
  type: 'success',
  title: 'Success!',
  message: 'Operation completed successfully',
  duration: 5000 // Optional, defaults to 5000ms
});
```

### useNotificationActions
Pre-built hook with common notification patterns.

**Location**: `src/hooks/useNotificationActions.ts`

**Available methods**:
- `showSuccess(title, message?)`
- `showError(title, message?)`
- `showWarning(title, message?)`
- `showInfo(title, message?)`
- `showCreateSuccess(entityName)`
- `showCreateError(entityName, error?)`
- `showUpdateSuccess(entityName)`
- `showUpdateError(entityName, error?)`
- `showDeleteSuccess(entityName)`
- `showDeleteError(entityName, error?)`
- `showLoading(action, entityName)`

## Usage Examples

### Basic Usage

```typescript
import { useNotificationActions } from '@/hooks/useNotificationActions';

function MyComponent() {
  const { showSuccess, showError, showLoading } = useNotificationActions();

  const handleSubmit = async () => {
    try {
      showLoading('Creating', 'Region');
      
      const response = await api.createRegion(data);
      
      if (response.success) {
        showSuccess('Region Created!', 'The region has been saved successfully.');
      } else {
        showError('Creation Failed', response.message);
      }
    } catch (error) {
      showError('Network Error', 'Failed to connect to the server.');
    }
  };

  return <button onClick={handleSubmit}>Create Region</button>;
}
```

### CRUD Operations

```typescript
import { useNotificationActions } from '@/hooks/useNotificationActions';

function RegionManager() {
  const {
    showCreateSuccess,
    showCreateError,
    showUpdateSuccess,
    showUpdateError,
    showDeleteSuccess,
    showDeleteError,
    showLoading
  } = useNotificationActions();

  const createRegion = async (data) => {
    showLoading('Creating', 'Region');
    try {
      await api.createRegion(data);
      showCreateSuccess('Region');
    } catch (error) {
      showCreateError('Region', error.message);
    }
  };

  const updateRegion = async (id, data) => {
    showLoading('Updating', 'Region');
    try {
      await api.updateRegion(id, data);
      showUpdateSuccess('Region');
    } catch (error) {
      showUpdateError('Region', error.message);
    }
  };

  const deleteRegion = async (id) => {
    showLoading('Deleting', 'Region');
    try {
      await api.deleteRegion(id);
      showDeleteSuccess('Region');
    } catch (error) {
      showDeleteError('Region', error.message);
    }
  };
}
```

## Configuration

### Notification Durations

Default durations for different notification types:
- **Success**: 5 seconds
- **Error**: 8 seconds (longer for important messages)
- **Warning**: 6 seconds
- **Info**: 4 seconds
- **Loading**: Custom duration or no auto-dismiss

### Customization

You can customize notification behavior by modifying the `NotificationContext.tsx`:

```typescript
// Change default duration
const duration = notification.duration || 5000;

// Disable auto-dismiss for certain notifications
const duration = notification.duration || 0; // 0 = no auto-dismiss
```

## Styling

The notification system uses Tailwind CSS classes and can be customized by modifying:

- `NotificationAlert.tsx` - Individual notification styles
- `NotificationContainer.tsx` - Container positioning and layout
- CSS variables in your global styles

### Color Schemes

- **Success**: Green theme (`bg-green-50`, `border-green-200`, `text-green-800`)
- **Error**: Red theme (`bg-red-50`, `border-red-200`, `text-red-800`)
- **Warning**: Yellow theme (`bg-yellow-50`, `border-yellow-200`, `text-yellow-800`)
- **Info**: Blue theme (`bg-blue-50`, `border-blue-200`, `text-blue-800`)

## Integration with Existing Components

The notification system has been integrated with:

- `CreateRegionForm` - Shows loading notification on submit
- `EditRegionForm` - Shows loading notification on submit
- `CreateProjectForm` - Shows loading notification on submit
- `EditProjectForm` - Shows loading notification on submit
- `EditPinForm` - Shows loading notification on submit
- `RegionsList` - Shows loading notification on delete
- `ProjectsList` - Shows loading notification on delete

## Best Practices

1. **Show loading notifications** before API calls to indicate progress
2. **Use appropriate notification types** for different scenarios
3. **Keep messages concise** but informative
4. **Handle errors gracefully** with meaningful error messages
5. **Use consistent entity names** across your application
6. **Test notification timing** to ensure good user experience

## Testing

The notification system can be tested using the `NotificationDemo` component:

```typescript
import NotificationDemo from '@/components/NotificationDemo';

// Add to any page for testing
<NotificationDemo />
```

## Troubleshooting

### Notifications not appearing
- Ensure `NotificationProvider` wraps your app in the root layout
- Check that `NotificationContainer` is included in the layout
- Verify that the hook is being called correctly

### Styling issues
- Ensure Tailwind CSS is properly configured
- Check that Heroicons are installed (`@heroicons/react`)
- Verify CSS classes are not being overridden

### Performance issues
- Notifications are automatically cleaned up after their duration
- The system uses React's useReducer for efficient state management
- Consider limiting the maximum number of concurrent notifications if needed
