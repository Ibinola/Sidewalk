import {
  groupedCaseNotificationSchema,
  type GroupedCaseNotification,
} from '@sidewalk/shared';

export class NotificationGroupingService {
  private readonly groups: Map<string, GroupedCaseNotification> = new Map();

  public addEventToCaseGroup(caseId: string, caseTitle: string, message: string): GroupedCaseNotification {
    const existing = this.groups.get(caseId);
    const now = new Date().toISOString();

    if (existing) {
      existing.updateCount += 1;
      existing.latestMessage = message;
      existing.lastEventAtIso = now;
      return groupedCaseNotificationSchema.parse(existing);
    }

    const newGroup: GroupedCaseNotification = {
      groupId: `grp_${Date.now()}`,
      caseId,
      caseTitle,
      updateCount: 1,
      latestMessage: message,
      participantCount: 1,
      firstEventAtIso: now,
      lastEventAtIso: now,
    };

    this.groups.set(caseId, newGroup);
    return groupedCaseNotificationSchema.parse(newGroup);
  }
}
