import {
  staleReportReminderSchema,
  type StaleReportReminder,
  type ReminderConfig,
} from '@qyou/shared';

export class StaleReportRemindersService {
  private readonly reminders: StaleReportReminder[] = [];
  private config: ReminderConfig = {
    enabled: true,
    defaultFrequency: 'weekly',
    staleAfterDays: 7,
    maxReminders: 5,
    channels: ['in_app'],
  };

  public detectStaleReports(reportIds: string[], staleThresholdDays: number): string[] {
    const now = Date.now();
    return reportIds.filter((id) => {
      const existing = this.reminders.find((r) => r.reportId === id && !r.dismissed);
      if (!existing) return true;
      const elapsed = now - new Date(existing.lastSentAtIso ?? existing.createdAtIso).getTime();
      return elapsed > staleThresholdDays * 24 * 60 * 60 * 1000;
    });
  }

  public createReminder(reportId: string, recipientId: string, frequency?: string): StaleReportReminder {
    const reminder: StaleReportReminder = {
      reminderId: `reminder_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      reportId,
      recipientId,
      createdAtIso: new Date().toISOString(),
      lastSentAtIso: null,
      acknowledgedAtIso: null,
      snoozedUntilIso: null,
      frequency: (frequency as StaleReportReminder['frequency']) ?? this.config.defaultFrequency,
      dismissed: false,
    };
    const validated = staleReportReminderSchema.parse(reminder);
    this.reminders.push(validated);
    return validated;
  }

  public snoozeReminder(reminderId: string, daysToSnooze: number): StaleReportReminder | null {
    const reminder = this.reminders.find((r) => r.reminderId === reminderId);
    if (!reminder) return null;
    const snoozedUntil = new Date();
    snoozedUntil.setDate(snoozedUntil.getDate() + daysToSnooze);
    reminder.snoozedUntilIso = snoozedUntil.toISOString();
    return reminder;
  }

  public acknowledgeReminder(reminderId: string): StaleReportReminder | null {
    const reminder = this.reminders.find((r) => r.reminderId === reminderId);
    if (!reminder) return null;
    reminder.acknowledgedAtIso = new Date().toISOString();
    return reminder;
  }

  public dismissReminder(reminderId: string): boolean {
    const reminder = this.reminders.find((r) => r.reminderId === reminderId);
    if (!reminder) return false;
    reminder.dismissed = true;
    return true;
  }

  public getPendingReminders(recipientId: string): StaleReportReminder[] {
    const now = new Date().toISOString();
    return this.reminders.filter(
      (r) =>
        r.recipientId === recipientId &&
        !r.dismissed &&
        r.acknowledgedAtIso === null &&
        (!r.snoozedUntilIso || r.snoozedUntilIso < now)
    );
  }

  public updateConfig(config: Partial<ReminderConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): ReminderConfig {
    return { ...this.config };
  }
}
