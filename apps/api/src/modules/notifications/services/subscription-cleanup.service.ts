import {
  subscriptionCleanupRuleSchema,
  subscriptionCleanupResultSchema,
  type SubscriptionCleanupRule,
  type SubscriptionCleanupResult,
} from '@sidewalk/shared';

export class SubscriptionCleanupService {
  private readonly rules: SubscriptionCleanupRule[] = [];
  private readonly results: SubscriptionCleanupResult[] = [];

  public addRule(rule: SubscriptionCleanupRule): SubscriptionCleanupRule {
    const validated = subscriptionCleanupRuleSchema.parse(rule);
    this.rules.push(validated);
    return validated;
  }

  public removeRule(ruleId: string): boolean {
    const idx = this.rules.findIndex((r) => r.ruleId === ruleId);
    if (idx === -1) return false;
    this.rules.splice(idx, 1);
    return true;
  }

  public getEnabledRules(): SubscriptionCleanupRule[] {
    return this.rules.filter((r) => r.enabled);
  }

  public getRulesByTrigger(trigger: string): SubscriptionCleanupRule[] {
    return this.rules.filter((r) => r.trigger === trigger && r.enabled);
  }

  public async cleanupOnReportClosed(reportId: string): Promise<SubscriptionCleanupResult> {
    return this.executeCleanup(reportId, 'report_closed');
  }

  public async cleanupOnReportMerged(sourceReportId: string): Promise<SubscriptionCleanupResult> {
    return this.executeCleanup(sourceReportId, 'report_merged');
  }

  public async cleanupOnReportArchived(reportId: string): Promise<SubscriptionCleanupResult> {
    return this.executeCleanup(reportId, 'report_archived');
  }

  public async manualCleanup(reportId: string): Promise<SubscriptionCleanupResult> {
    return this.executeCleanup(reportId, 'manual');
  }

  public async batchCleanup(reportIds: string[], trigger: string): Promise<SubscriptionCleanupResult[]> {
    const results: SubscriptionCleanupResult[] = [];
    for (const reportId of reportIds) {
      results.push(await this.executeCleanup(reportId, trigger));
    }
    return results;
  }

  public getResults(): SubscriptionCleanupResult[] {
    return [...this.results];
  }

  private async executeCleanup(reportId: string, trigger: string): Promise<SubscriptionCleanupResult> {
    const matchingRules = this.getRulesByTrigger(trigger);
    let removedCount = 0;
    let notifiedCount = 0;

    for (const rule of matchingRules) {
      rule.lastRunAtIso = new Date().toISOString();
      rule.runCount += 1;
      if (rule.action === 'remove_subscription') removedCount += 1;
      if (rule.action === 'notify_subscriber') notifiedCount += 1;
    }

    const result: SubscriptionCleanupResult = {
      ruleId: matchingRules[0]?.ruleId ?? 'no_rule',
      trigger: trigger as SubscriptionCleanupResult['trigger'],
      removedCount,
      notifiedCount,
      executedAtIso: new Date().toISOString(),
    };
    const validated = subscriptionCleanupResultSchema.parse(result);
    this.results.push(validated);
    return validated;
  }
}
