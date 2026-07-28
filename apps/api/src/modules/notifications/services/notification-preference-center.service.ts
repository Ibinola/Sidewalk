import {
  preferenceUpdatePayloadSchema,
  type NotificationCategoryPreferences,
  type PreferenceUpdatePayload,
} from '@sidewalk/shared';

export class NotificationPreferenceCenterService {
  private readonly userPreferences: Map<string, NotificationCategoryPreferences> = new Map();

  public getPreferences(userId: string): PreferenceUpdatePayload {
    const defaultChannels = { email: true, push: true, inApp: true };
    const prefs = this.userPreferences.get(userId) ?? {
      reportStatusChanges: defaultChannels,
      moderationActions: defaultChannels,
      communityReplies: defaultChannels,
      neighborhoodAlerts: defaultChannels,
    };

    const payload: PreferenceUpdatePayload = {
      userId,
      preferences: prefs,
      updatedAtIso: new Date().toISOString(),
    };

    return preferenceUpdatePayloadSchema.parse(payload);
  }

  public updatePreferences(userId: string, newPrefs: NotificationCategoryPreferences): void {
    this.userPreferences.set(userId, newPrefs);
  }
}
