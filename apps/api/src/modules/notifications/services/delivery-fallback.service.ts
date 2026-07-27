import {
  deliveryFallbackStrategySchema,
  fallbackAttemptSchema,
  deliveryFailureLogSchema,
  type DeliveryFallbackStrategy,
  type FallbackAttempt,
  type DeliveryFailureLog,
} from '@sidewalk/shared';

const DEFAULT_STRATEGY: DeliveryFallbackStrategy = {
  primaryChannel: 'inApp',
  fallbackOrder: ['email', 'push', 'inApp'],
  maxRetries: 3,
  backoffBaseMs: 1000,
};

export class DeliveryFallbackService {
  private readonly logs: Map<string, DeliveryFailureLog> = new Map();

  public async deliverWithFallback(
    notificationId: string,
    primaryChannel: 'email' | 'push' | 'inApp',
    deliverFn: (channel: string) => Promise<boolean>,
    strategy?: Partial<DeliveryFallbackStrategy>,
  ): Promise<DeliveryFailureLog> {
    const resolvedStrategy = deliveryFallbackStrategySchema.parse({
      ...DEFAULT_STRATEGY,
      ...strategy,
      primaryChannel,
    });

    const attempts: FallbackAttempt[] = [];
    const channels = [primaryChannel, ...resolvedStrategy.fallbackOrder.filter((c) => c !== primaryChannel)];

    let finalStatus: 'delivered' | 'failed_all' = 'failed_all';

    for (const channel of channels) {
      for (let retry = 0; retry < resolvedStrategy.maxRetries; retry++) {
        const attempt: FallbackAttempt = {
          attemptId: `fa_${Date.now()}_${channel}_${retry}`,
          notificationId,
          channel,
          status: 'pending',
          attemptedAtIso: new Date().toISOString(),
        };

        try {
          const success = await deliverFn(channel);
          attempt.status = success ? 'success' : 'failed';
          if (!success) {
            attempt.error = `Channel ${channel} returned false`;
          }
        } catch (err) {
          attempt.status = 'failed';
          attempt.error = err instanceof Error ? err.message : String(err);
        }

        attempts.push(fallbackAttemptSchema.parse(attempt));

        if (attempt.status === 'success') {
          finalStatus = 'delivered';
          break;
        }

        if (retry < resolvedStrategy.maxRetries - 1) {
          const backoffMs = resolvedStrategy.backoffBaseMs * Math.pow(2, retry);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      }

      if (finalStatus === 'delivered') break;
    }

    const log: DeliveryFailureLog = {
      logId: `dfl_${Date.now()}_${notificationId}`,
      notificationId,
      strategy: resolvedStrategy,
      attempts,
      finalStatus,
      completedAtIso: new Date().toISOString(),
    };

    const validated = deliveryFailureLogSchema.parse(log);
    this.logs.set(validated.logId, validated);
    return validated;
  }

  public getLogsForNotification(notificationId: string): DeliveryFailureLog[] {
    return Array.from(this.logs.values()).filter((l) => l.notificationId === notificationId);
  }

  public getAllLogs(): DeliveryFailureLog[] {
    return Array.from(this.logs.values());
  }

  public getLog(logId: string): DeliveryFailureLog | undefined {
    return this.logs.get(logId);
  }
}

export const deliveryFallbackService = new DeliveryFallbackService();
