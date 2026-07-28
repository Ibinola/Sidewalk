import {
  toastNotificationMessageSchema,
  type RealtimeStatusPayload,
} from '@sidewalk/shared';

export class RealtimeStatusBroadcasterService {
  public broadcastStatusChange(caseId: string, newStatus: string): RealtimeStatusPayload {
    const toast = {
      id: `toast_${Date.now()}`,
      level: 'info' as const,
      title: 'Case Status Updated',
      message: `Case ${caseId} changed status to: ${newStatus}`,
      autoDismissMs: 5000,
    };

    const validatedToast = toastNotificationMessageSchema.parse(toast);

    return {
      caseId,
      newStatus,
      updatedAtIso: new Date().toISOString(),
      toast: validatedToast,
    };
  }
}
