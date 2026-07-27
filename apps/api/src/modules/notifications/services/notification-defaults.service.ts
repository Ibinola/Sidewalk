import {
  defaultPreferenceProfileSchema,
  anonymousVisitorDefaultsSchema,
  type NotificationDefaults,
  type DefaultPreferenceProfile,
  type AnonymousVisitorDefaults,
} from '@sidewalk/shared';

const MINIMAL_DEFAULTS: NotificationDefaults = { email: false, push: false, inApp: true };

export class NotificationDefaultsService {
  private readonly profiles: Map<string, DefaultPreferenceProfile> = new Map();
  private readonly anonSessions: Map<string, AnonymousVisitorDefaults> = new Map();

  public provideDefaultsForUser(userId: string): DefaultPreferenceProfile {
    const existing = this.profiles.get(userId);
    if (existing) return existing;

    const profile: DefaultPreferenceProfile = {
      userId,
      defaults: { ...MINIMAL_DEFAULTS },
      isOptInModel: true,
      appliedAtIso: new Date().toISOString(),
    };
    const validated = defaultPreferenceProfileSchema.parse(profile);
    this.profiles.set(userId, validated);
    return validated;
  }

  public provideDefaultsForAnonymous(sessionId: string): AnonymousVisitorDefaults {
    const existing = this.anonSessions.get(sessionId);
    if (existing) return existing;

    const visitor: AnonymousVisitorDefaults = {
      defaults: { ...MINIMAL_DEFAULTS },
      sessionId,
      assignedAtIso: new Date().toISOString(),
    };
    const validated = anonymousVisitorDefaultsSchema.parse(visitor);
    this.anonSessions.set(sessionId, validated);
    return validated;
  }

  public optInUser(userId: string, channel: 'email' | 'push' | 'inApp'): DefaultPreferenceProfile {
    const profile = this.profiles.get(userId) ?? this.provideDefaultsForUser(userId);
    const updated: DefaultPreferenceProfile = {
      ...profile,
      defaults: { ...profile.defaults, [channel]: true },
      appliedAtIso: new Date().toISOString(),
    };
    const validated = defaultPreferenceProfileSchema.parse(updated);
    this.profiles.set(userId, validated);
    return validated;
  }

  public optOutUser(userId: string, channel: 'email' | 'push' | 'inApp'): DefaultPreferenceProfile {
    const profile = this.profiles.get(userId) ?? this.provideDefaultsForUser(userId);
    const updated: DefaultPreferenceProfile = {
      ...profile,
      defaults: { ...profile.defaults, [channel]: false },
      appliedAtIso: new Date().toISOString(),
    };
    const validated = defaultPreferenceProfileSchema.parse(updated);
    this.profiles.set(userId, validated);
    return validated;
  }

  public getDefaults(userId: string): NotificationDefaults {
    const profile = this.profiles.get(userId);
    return profile?.defaults ?? { ...MINIMAL_DEFAULTS };
  }
}

export const notificationDefaultsService = new NotificationDefaultsService();
