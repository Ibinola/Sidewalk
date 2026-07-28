export const reportReminderService = {
  async sendStaleReportReminders(_userId: string) {
    // Logic to send opt-in reminders for stale reports
    return true;
  },

  async optInForReminders(_userId: string) {
    // Logic for user to opt-in to stale report reminders
    return true;
  }
}
