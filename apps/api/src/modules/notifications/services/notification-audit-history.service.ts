import {
  notificationAuditLogItemSchema,
  type NotificationAuditLogItem,
} from '@sidewalk/shared';

export class NotificationAuditHistoryService {
  private readonly logs: NotificationAuditLogItem[] = [];

  public logDispatch(item: NotificationAuditLogItem): NotificationAuditLogItem {
    const validated = notificationAuditLogItemSchema.parse(item);
    this.logs.push(validated);
    return validated;
  }

  public getHistoryForUser(recipientId: string): NotificationAuditLogItem[] {
    return this.logs.filter((log) => log.recipientId === recipientId);
  }
}
