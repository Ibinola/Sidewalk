import {
  unreadBadgeStateSchema,
  type UnreadBadgeState,
} from '@sidewalk/shared';

export class UnreadBadgeCounterService {
  private readonly unreadCounts: Map<string, UnreadBadgeState> = new Map();

  public getUnreadBadgeState(userId: string): UnreadBadgeState {
    const existing = this.unreadCounts.get(userId) ?? {
      totalUnread: 3,
      caseUpdatesUnread: 2,
      moderationUnread: 0,
      directRepliesUnread: 1,
      hasUrgentUnread: false,
    };
    return unreadBadgeStateSchema.parse(existing);
  }

  public markAllRead(userId: string): UnreadBadgeState {
    const cleared: UnreadBadgeState = {
      totalUnread: 0,
      caseUpdatesUnread: 0,
      moderationUnread: 0,
      directRepliesUnread: 0,
      hasUrgentUnread: false,
    };
    this.unreadCounts.set(userId, cleared);
    return unreadBadgeStateSchema.parse(cleared);
  }
}
