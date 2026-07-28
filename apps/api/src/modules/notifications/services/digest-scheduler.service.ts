import {
  digestPayloadSchema,
  type DigestScheduleFrequency,
  type DigestPayload,
  type NotificationSummaryItem,
} from '@sidewalk/shared';

interface RawNotification {
  id: string;
  title: string;
  body: string;
  type: string;
}

export class DigestSchedulerService {
  public generateDigest(
    recipientId: string,
    frequency: DigestScheduleFrequency,
    rawNotifications: RawNotification[]
  ): DigestPayload | null {
    if (frequency === 'none' || rawNotifications.length === 0) return null;

    const items: NotificationSummaryItem[] = rawNotifications.slice(0, 5).map(n => ({
      id: n.id,
      title: n.title,
      snippet: n.body.substring(0, 50),
      type: n.type,
    }));

    const payload: DigestPayload = {
      recipientId,
      frequency,
      items,
      generatedAtIso: new Date().toISOString(),
      totalUnreadCount: rawNotifications.length,
    };

    return digestPayloadSchema.parse(payload);
  }
}
