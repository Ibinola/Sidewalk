import {
  toastNotificationSchema,
  type ToastNotification,
  type StatusChangeContext,
} from '@qyou/shared';

export class ToastTriggerService {
  public triggerStatusChangeToast(context: StatusChangeContext): ToastNotification {
    const payload: ToastNotification = {
      toastId: `toast_${Date.now()}`,
      type: 'success',
      title: 'Status Updated',
      message: `Case status changed from ${context.oldStatus} to ${context.newStatus}`,
      context,
      durationMs: 4000,
    };

    return toastNotificationSchema.parse(payload);
  }
}
