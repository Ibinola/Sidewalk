import {
  persistentUserSettingsSchema,
  type PersistentUserSettings,
  type PersistentUserSettingsInput,
} from '@sidewalk/shared';

export class NotificationSettingsPersistenceService {
  private readonly store: Map<string, PersistentUserSettings> = new Map();

  public async saveUserSettings(input: PersistentUserSettingsInput): Promise<PersistentUserSettings> {
    const validated = persistentUserSettingsSchema.parse(input);
    this.store.set(validated.userId, validated);
    return validated;
  }

  public async getUserSettings(userId: string): Promise<PersistentUserSettings> {
    const existing = this.store.get(userId);
    if (existing) return existing;

    const defaultSettings: PersistentUserSettings = {
      userId,
      emailDigestEnabled: true,
      pushAlertsEnabled: true,
      devices: [],
      lastSyncedAtIso: new Date().toISOString(),
    };
    return persistentUserSettingsSchema.parse(defaultSettings);
  }
}
