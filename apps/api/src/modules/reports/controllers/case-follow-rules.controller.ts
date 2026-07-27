import type { Request, Response } from "express";
import { NotFoundError, ValidationError } from "../../../shared/errors/AppError.js";
import { caseFollowRulesService } from "../../cases/services/case-follow-rules.service.js";
import type { AuthTokenPayload } from "../../auth/types/auth.types.js";
import { prisma } from "../../../shared/database/prisma.js";

export const caseFollowRulesController = {
  async follow(req: Request, res: Response): Promise<void> {
    const caseId = req.params.id as string;
    const user = (req as any).user as AuthTokenPayload;

    const report = await prisma.report.findUnique({ where: { id: caseId } });
    if (!report) throw new NotFoundError(`Report ${caseId} not found`);

    const rule = await caseFollowRulesService.addRule(caseId, user.sub, "case_created");
    res.status(200).json({ success: true, data: rule });
  },

  async unfollow(req: Request, res: Response): Promise<void> {
    const caseId = req.params.id as string;
    const user = (req as any).user as AuthTokenPayload;

    const removed = await caseFollowRulesService.unfollow(caseId, user.sub);
    if (!removed) {
      throw new NotFoundError("No active follow rule found");
    }
    res.status(200).json({ success: true, message: "Unfollowed" });
  },

  async getFollowers(req: Request, res: Response): Promise<void> {
    const caseId = req.params.id as string;

    const rules = await caseFollowRulesService.getRulesForCase(caseId);
    res.status(200).json({
      success: true,
      data: rules.map((r) => ({
        userId: r.userId,
        triggerCondition: r.triggerCondition,
        notificationConfig: r.notificationConfig,
        followedAt: r.createdAtIso,
      })),
      count: rules.length,
    });
  },

  async getFollowStatus(req: Request, res: Response): Promise<void> {
    const caseId = req.params.id as string;
    const user = (req as any).user as AuthTokenPayload;

    const following = await caseFollowRulesService.isFollowing(caseId, user.sub);
    res.status(200).json({ success: true, data: { following } });
  },

  async getFollowedReports(req: Request, res: Response): Promise<void> {
    const user = (req as any).user as AuthTokenPayload;
    const rules = await caseFollowRulesService.getRulesForUser(user.sub);

    const caseIds = rules.map((r) => r.caseId);
    if (caseIds.length === 0) {
      res.status(200).json({ success: true, data: [], total: 0 });
      return;
    }

    const reports = await prisma.report.findMany({
      where: { id: { in: caseIds } },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: reports.map((report) => {
        const rule = rules.find((r) => r.caseId === report.id);
        return {
          id: report.id,
          title: report.title,
          status: report.status,
          followTrigger: rule?.triggerCondition ?? null,
          followedAt: rule?.createdAtIso ?? null,
          createdAt: report.createdAt.toISOString(),
        };
      }),
      total: reports.length,
    });
  },
};
