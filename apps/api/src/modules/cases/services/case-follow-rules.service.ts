import {
  caseFollowRuleSchema,
  type CaseFollowRule,
  type FollowTriggerCondition,
  type FollowNotificationConfig,
} from '@qyou/shared';

export class CaseFollowRulesService {
  private readonly rules: Map<string, CaseFollowRule> = new Map();

  public addRule(
    caseId: string,
    userId: string,
    triggerCondition: FollowTriggerCondition,
    notificationConfig?: Partial<FollowNotificationConfig>
  ): CaseFollowRule {
    const now = new Date().toISOString();
    const rule: CaseFollowRule = {
      ruleId: `rule_${caseId}_${userId}_${Date.now()}`,
      caseId,
      userId,
      triggerCondition,
      notificationConfig: {
        onNewComment: notificationConfig?.onNewComment ?? true,
        onStatusChange: notificationConfig?.onStatusChange ?? true,
        onAssignment: notificationConfig?.onAssignment ?? true,
        onMention: notificationConfig?.onMention ?? true,
      },
      isActive: true,
      createdAtIso: now,
      updatedAtIso: now,
    };

    const validated = caseFollowRuleSchema.parse(rule);
    this.rules.set(validated.ruleId, validated);
    return validated;
  }

  public autoFollowOnCreation(caseId: string, creatorUserId: string): CaseFollowRule {
    return this.addRule(caseId, creatorUserId, 'case_created');
  }

  public autoFollowOnComment(caseId: string, commenterUserId: string): CaseFollowRule {
    return this.addRule(caseId, commenterUserId, 'new_comment');
  }

  public autoFollowOnStatusChange(caseId: string, actorUserId: string): CaseFollowRule {
    return this.addRule(caseId, actorUserId, 'status_change');
  }

  public unfollow(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;
    rule.isActive = false;
    rule.updatedAtIso = new Date().toISOString();
    this.rules.set(ruleId, rule);
    return true;
  }

  public unfollowByCaseAndUser(caseId: string, userId: string): boolean {
    const rule = this.findActiveRule(caseId, userId);
    if (!rule) return false;
    return this.unfollow(rule.ruleId);
  }

  public getRulesForCase(caseId: string): CaseFollowRule[] {
    return Array.from(this.rules.values()).filter(
      (r) => r.caseId === caseId && r.isActive
    );
  }

  public getRulesForUser(userId: string): CaseFollowRule[] {
    return Array.from(this.rules.values()).filter(
      (r) => r.userId === userId && r.isActive
    );
  }

  public findActiveRule(caseId: string, userId: string): CaseFollowRule | undefined {
    return Array.from(this.rules.values()).find(
      (r) => r.caseId === caseId && r.userId === userId && r.isActive
    );
  }

  public isFollowing(caseId: string, userId: string): boolean {
    return this.findActiveRule(caseId, userId) !== undefined;
  }

  public getNotificationRecipients(
    caseId: string,
    triggerCondition: FollowTriggerCondition
  ): string[] {
    return Array.from(this.rules.values())
      .filter(
        (r) =>
          r.caseId === caseId &&
          r.isActive &&
          r.triggerCondition === triggerCondition
      )
      .map((r) => r.userId);
  }

  public updateNotificationConfig(
    ruleId: string,
    config: Partial<FollowNotificationConfig>
  ): CaseFollowRule | null {
    const rule = this.rules.get(ruleId);
    if (!rule) return null;

    if (config.onNewComment !== undefined) rule.notificationConfig.onNewComment = config.onNewComment;
    if (config.onStatusChange !== undefined) rule.notificationConfig.onStatusChange = config.onStatusChange;
    if (config.onAssignment !== undefined) rule.notificationConfig.onAssignment = config.onAssignment;
    if (config.onMention !== undefined) rule.notificationConfig.onMention = config.onMention;
    rule.updatedAtIso = new Date().toISOString();

    const validated = caseFollowRuleSchema.parse(rule);
    this.rules.set(ruleId, validated);
    return validated;
  }
}
