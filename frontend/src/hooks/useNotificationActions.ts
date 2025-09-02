import { useNotifications } from '@/contexts/NotificationContext';

export function useNotificationActions() {
  const { addNotification } = useNotifications();

  const showSuccess = (title: string, message?: string) => {
    addNotification({
      type: 'success',
      title,
      message,
      duration: 5000,
    });
  };

  const showError = (title: string, message?: string) => {
    addNotification({
      type: 'error',
      title,
      message,
      duration: 8000, // Errors stay longer
    });
  };

  const showWarning = (title: string, message?: string) => {
    addNotification({
      type: 'warning',
      title,
      message,
      duration: 6000,
    });
  };

  const showInfo = (title: string, message?: string) => {
    addNotification({
      type: 'info',
      title,
      message,
      duration: 4000,
    });
  };

  // CRUD operation notifications
  const showCreateSuccess = (entityName: string) => {
    showSuccess(
      `${entityName} Created Successfully`,
      `The ${entityName.toLowerCase()} has been created and saved.`
    );
  };

  const showCreateError = (entityName: string, error?: string) => {
    showError(
      `Failed to Create ${entityName}`,
      error || `An error occurred while creating the ${entityName.toLowerCase()}. Please try again.`
    );
  };

  const showUpdateSuccess = (entityName: string) => {
    showSuccess(
      `${entityName} Updated Successfully`,
      `The ${entityName.toLowerCase()} has been updated and saved.`
    );
  };

  const showUpdateError = (entityName: string, error?: string) => {
    showError(
      `Failed to Update ${entityName}`,
      error || `An error occurred while updating the ${entityName.toLowerCase()}. Please try again.`
    );
  };

  const showDeleteSuccess = (entityName: string) => {
    showSuccess(
      `${entityName} Deleted Successfully`,
      `The ${entityName.toLowerCase()} has been permanently removed.`
    );
  };

  const showDeleteError = (entityName: string, error?: string) => {
    showError(
      `Failed to Delete ${entityName}`,
      error || `An error occurred while deleting the ${entityName.toLowerCase()}. Please try again.`
    );
  };

  const showLoading = (action: string, entityName: string) => {
    showInfo(
      `${action} in Progress`,
      `Please wait while we ${action.toLowerCase()} the ${entityName.toLowerCase()}.`
    );
  };

  return {
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
    showLoading,
  };
}
