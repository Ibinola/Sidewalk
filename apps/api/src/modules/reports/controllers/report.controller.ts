import type { Request, Response } from "express";
import { ValidationError } from "../../../shared/errors/AppError.js";
import { reportService } from "../services/report.service.js";
import { reportSubmissionSchema, moderationSchema } from "../validators/report.validator.js";
import type { AuthenticatedRequest } from "../../../shared/middleware/requireAuth.js";
import { caseFollowRulesService } from "../../cases/services/case-follow-rules.service.js";

export const reportController = {
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = reportSubmissionSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message);
    }

    const result = await reportService.create(parsed.data, { sub: req.userId! });

    await caseFollowRulesService.autoFollowOnCreation(result.id, req.userId!);

    res.status(201).json({ success: true, data: result });
  },

  async list(req: Request, res: Response): Promise<void> {
    const status = req.query.status as string | undefined;
    const authorId = req.query.authorId as string | undefined;
    const result = await reportService.list({ status, authorId });
    res.json({ success: true, data: result.reports, total: result.total });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const report = await reportService.findById(id);
    res.json({ success: true, data: report });
  },

  async moderate(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = moderationSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message);
    }

    const id = req.params.id as string;
    const report = await reportService.moderate(id, parsed.data, req.userId!);

    await caseFollowRulesService.autoFollowOnStatusChange(id, req.userId!);

    res.json({ success: true, data: report });
  },
};
