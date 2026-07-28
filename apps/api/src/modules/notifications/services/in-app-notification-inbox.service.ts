import {
  inAppNotificationItemSchema,
  type InAppNotificationItem,
} from '@sidewalk/shared';

export class InAppNotificationInboxService {
  private readonly inboxStore: Map<string, InAppNotificationItem[]> = new Map();

  public getInboxItems(userId: string): InAppNotificationItem[] {
    const list = this.inboxStore.get(userId) ?? [];
    return list.map((item) => inAppNotificationItemSchema.parse(item));
  }

  public addNotification(item: InAppNotificationItem): void {
    const validated = inAppNotificationItemSchema.parse(item);
    const list = this.inboxStore.get(validated.recipientUserId) ?? [];
    list.unshift(validated);
    this.inboxStore.set(validated.recipientUserId, list);
  }
}
