import {
  deliveryChannelPreferencesSchema,
  alertDeliveryPayloadSchema,
  type DeliveryChannelPreferences,
  type AlertDeliveryPayload,
} from '@sidewalk/shared';

export class DeliveryChannelService {
  private readonly userPreferences: Map<string, DeliveryChannelPreferences> = new Map();

  public routeAlert(recipientId: string, alertId: string, isUrgent: boolean): AlertDeliveryPayload {
    const prefs = this.userPreferences.get(recipientId) ?? deliveryChannelPreferencesSchema.parse({ userId: recipientId });
    const targetChannels: string[] = [];

    const overrides = isUrgent ? prefs.urgentChannels : prefs.defaultChannels;

    if (overrides.email !== false) targetChannels.push('email');
    if (overrides.push !== false) targetChannels.push('push');
    if (overrides.inApp !== false) targetChannels.push('inApp');

    const payload: AlertDeliveryPayload = {
      alertId,
      recipientId,
      targetChannels,
      payloadTimestamp: new Date().toISOString(),
    };

    return alertDeliveryPayloadSchema.parse(payload);
  }
}
