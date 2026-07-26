import {
  pushRegistrationDataSchema,
  type PushRegistrationData,
} from '@qyou/shared';

export class PushDocsService {
  private readonly deviceTokens: Map<string, PushRegistrationData> = new Map();

  public registerDevice(userId: string, data: PushRegistrationData): void {
    const validatedData = pushRegistrationDataSchema.parse(data);
    this.deviceTokens.set(userId, validatedData);
  }

  public unregisterDevice(userId: string): void {
    this.deviceTokens.delete(userId);
  }
}
