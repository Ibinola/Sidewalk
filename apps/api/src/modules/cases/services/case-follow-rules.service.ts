import { prisma } from "../../../shared/database/prisma.js";
import {
  caseFollowRuleSchema,
  type CaseFollowRule,
  type FollowTriggerCondition,
  type FollowNotificationConfig,
} from "@sidewalk/shared";

function toCaseFollowRule(row: {
  id: string;
  caseId: string;
  userId: string;
  triggerCondition: string;
  onNewComment: boolean;
  onStatusChange: boolean;
  onAssignment: boolean;
  onMention: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): CaseFollowRule {
  return {
    ruleId: row.id,
    caseId: row.caseId,
    userId: row.userId,
    triggerCondition: row.triggerCondition as FollowTriggerCondition,
    notificationConfig: {
      onNewComment: row.onNewComment,
      onStatusChange: row.onStatusChange,
      onAssignment: row.onAssignment,
      onMention: row.onMention,
    },
    isActive: row.isActive,
    createdAtIso: row.createdAt.toISOString(),
    updatedAtIso: row.updatedAt.toISOString(),
  };
}

export const caseFollowRulesService = {
  async addRule(
    caseId: string,
    userId: string,
    triggerCondition: FollowTriggerCondition,
    notificationConfig?: Partial<FollowNotificationConfig>,
  ): Promise<CaseFollowRule> {
    const row = await prisma.caseFollowRule.upsert({
      where: { caseId_userId: { caseId, userId } },
      update: { isActive: true, triggerCondition },
      create: {
        caseId,
        userId,
        triggerCondition,
        onNewComment: notificationConfig?.onNewComment ?? true,
        onStatusChange: notificationConfig?.onStatusChange ?? true,
        onAssignment: notificationConfig?.onAssignment ?? true,
        onMention: notificationConfig?.onMention ?? true,
      },
    });
    return caseFollowRuleSchema.parse(toCaseFollowRule(row));
  },

  async autoFollowOnCreation(
    caseId: string,
    creatorUserId: string,
  ): Promise<CaseFollowRule> {
    return this.addRule(caseId, creatorUserId, "case_created");
  },

  async autoFollowOnComment(
    caseId: string,
    commenterUserId: string,
  ): Promise<CaseFollowRule> {
    return this.addRule(caseId, commenterUserId, "new_comment");
  },

  async autoFollowOnStatusChange(
    caseId: string,
    actorUserId: string,
  ): Promise<CaseFollowRule> {
    return this.addRule(caseId, actorUserId, "status_change");
  },

  async autoFollowOnAssignment(
    caseId: string,
    assigneeUserId: string,
  ): Promise<CaseFollowRule> {
    return this.addRule(caseId, assigneeUserId, "assigned_to_me");
  },

  async unfollow(
    caseId: string,
    userId: string,
  ): Promise<boolean> {
    const result = await prisma.caseFollowRule.updateMany({
      where: { caseId, userId, isActive: true },
      data: { isActive: false },
    });
    return result.count > 0;
  },

  async getRulesForCase(caseId: string): Promise<CaseFollowRule[]> {
    const rows = await prisma.caseFollowRule.findMany({
      where: { caseId, isActive: true },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toCaseFollowRule);
  },

  async getRulesForUser(userId: string): Promise<CaseFollowRule[]> {
    const rows = await prisma.caseFollowRule.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toCaseFollowRule);
  },

  async isFollowing(
    caseId: string,
    userId: string,
  ): Promise<boolean> {
    const row = await prisma.caseFollowRule.findUnique({
      where: { caseId_userId: { caseId, userId } },
    });
    return row?.isActive ?? false;
  },

  async getNotificationRecipients(
    caseId: string,
    triggerCondition: FollowTriggerCondition,
  ): Promise<string[]> {
    const rows = await prisma.caseFollowRule.findMany({
      where: { caseId, isActive: true, triggerCondition },
      select: { userId: true },
    });
    return rows.map((r) => r.userId);
  },

  async updateNotificationConfig(
    caseId: string,
    userId: string,
    config: Partial<FollowNotificationConfig>,
  ): Promise<CaseFollowRule | null> {
    const row = await prisma.caseFollowRule.findUnique({
      where: { caseId_userId: { caseId, userId } },
    });
    if (!row || !row.isActive) return null;

    const updated = await prisma.caseFollowRule.update({
      where: { caseId_userId: { caseId, userId } },
      data: {
        ...(config.onNewComment !== undefined && { onNewComment: config.onNewComment }),
        ...(config.onStatusChange !== undefined && { onStatusChange: config.onStatusChange }),
        ...(config.onAssignment !== undefined && { onAssignment: config.onAssignment }),
        ...(config.onMention !== undefined && { onMention: config.onMention }),
      },
    });
    return caseFollowRuleSchema.parse(toCaseFollowRule(updated));
  },
};
