import { describe, it, expect } from 'vitest';
import type { GroupedNotification, NotificationUpdate } from '@sidewalk/shared';

function groupNotificationsByCase(notifications: NotificationUpdate[], caseIdExtractor: (n: NotificationUpdate) => string): GroupedNotification[] {
  const map = new Map<string, NotificationUpdate[]>();

  for (const notification of notifications) {
    const caseId = caseIdExtractor(notification);
    const existing = map.get(caseId) ?? [];
    existing.push(notification);
    map.set(caseId, existing);
  }

  const groups: GroupedNotification[] = [];
  for (const [caseId, updates] of map) {
    const sorted = [...updates].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    groups.push({
      caseId,
      caseTitle: sorted[0].message,
      updates: sorted,
      count: sorted.length,
      latestUpdate: sorted[0].createdAt,
    });
  }

  return groups.sort((a, b) => b.latestUpdate.getTime() - a.latestUpdate.getTime());
}

function mergeSameTypeUpdates(updates: NotificationUpdate[]): NotificationUpdate[] {
  const byType = new Map<string, NotificationUpdate[]>();
  for (const update of updates) {
    const existing = byType.get(update.type) ?? [];
    existing.push(update);
    byType.set(update.type, existing);
  }

  const merged: NotificationUpdate[] = [];
  for (const [, group] of byType) {
    const latest = [...group].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    merged.push({ ...latest, message: `${group.length} ${latest.type} updates` });
  }

  return merged;
}

describe('Notification Grouping', () => {
  const now = new Date('2025-01-15T10:00:00Z');

  const baseNotifications: NotificationUpdate[] = [
    { id: '1', type: 'status_change', message: 'Case opened', createdAt: new Date('2025-01-15T08:00:00Z') },
    { id: '2', type: 'comment', message: 'New comment', createdAt: new Date('2025-01-15T09:00:00Z') },
    { id: '3', type: 'status_change', message: 'Case updated', createdAt: new Date('2025-01-15T10:00:00Z') },
    { id: '4', type: 'comment', message: 'Another comment', createdAt: new Date('2025-01-15T09:30:00Z') },
  ];

  it('groups notifications by case ID', () => {
    const notifications: NotificationUpdate[] = [
      { id: '1', type: 'status_change', message: 'Case A updated', createdAt: now },
      { id: '2', type: 'comment', message: 'Case B comment', createdAt: now },
      { id: '3', type: 'status_change', message: 'Case A opened', createdAt: now },
    ];

    const groups = groupNotificationsByCase(notifications, () => 'case-a');
    expect(groups).toHaveLength(1);
    expect(groups[0].caseId).toBe('case-a');
    expect(groups[0].count).toBe(3);
  });

  it('sorts by latest update', () => {
    const groups = groupNotificationsByCase(baseNotifications, () => 'case-x');
    expect(groups[0].latestUpdate.getTime()).toBe(now.getTime());
  });

  it('handles empty notification list', () => {
    const groups = groupNotificationsByCase([], () => 'case-x');
    expect(groups).toHaveLength(0);
  });

  it('merges same-type updates', () => {
    const merged = mergeSameTypeUpdates(baseNotifications);
    const statusUpdates = merged.filter((u) => u.type === 'status_change');
    expect(statusUpdates).toHaveLength(1);
    expect(statusUpdates[0].message).toContain('2');
  });
});
