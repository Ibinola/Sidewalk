import {
  subscriptionRuleSchema,
  type SubscriptionRule,
  type SubscriptionRulePayload,
} from '@qyou/shared';

export class SubscriptionRulesService {
  private readonly rulesStore: Map<string, SubscriptionRule[]> = new Map();

  public getRules(userId: string): SubscriptionRule[] {
    const list = this.rulesStore.get(userId) ?? [];
    return list.map((r) => subscriptionRuleSchema.parse(r));
  }

  public addRule(payload: SubscriptionRulePayload): SubscriptionRule {
    const now = new Date().toISOString();
    const rule: SubscriptionRule = {
      id: crypto.randomUUID(),
      ...payload,
      createdAtIso: now,
      updatedAtIso: now,
    };
    const validated = subscriptionRuleSchema.parse(rule);
    const list = this.rulesStore.get(payload.userId) ?? [];
    list.push(validated);
    this.rulesStore.set(payload.userId, list);
    return validated;
  }

  public removeRule(userId: string, ruleId: string): boolean {
    const list = this.rulesStore.get(userId) ?? [];
    const idx = list.findIndex((r) => r.id === ruleId);
    if (idx === -1) return false;
    list.splice(idx, 1);
    this.rulesStore.set(userId, list);
    return true;
  }

  public updateRuleScope(userId: string, ruleId: string, scope: SubscriptionRule['scope']): SubscriptionRule | null {
    const list = this.rulesStore.get(userId) ?? [];
    const rule = list.find((r) => r.id === ruleId);
    if (!rule) return null;
    rule.scope = scope;
    rule.updatedAtIso = new Date().toISOString();
    return subscriptionRuleSchema.parse(rule);
  }
}
