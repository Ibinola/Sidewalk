import { Router, type Router as RouterType } from "express";
import { requireAuth } from "../../../shared/middleware/requireAuth.js";
import { reportController } from "../controllers/report.controller.js";
import { caseFollowRulesController } from "../controllers/case-follow-rules.controller.js";

const router: RouterType = Router();

router.post("/reports", requireAuth, reportController.create);
router.get("/reports", requireAuth, reportController.list);
router.get("/reports/:id", requireAuth, reportController.getById);
router.post("/reports/:id/moderate", requireAuth, reportController.moderate);

router.post("/reports/:id/follow", requireAuth, caseFollowRulesController.follow);
router.delete("/reports/:id/follow", requireAuth, caseFollowRulesController.unfollow);
router.get("/reports/:id/followers", requireAuth, caseFollowRulesController.getFollowers);
router.get("/reports/:id/follow-status", requireAuth, caseFollowRulesController.getFollowStatus);
router.get("/reports/followed", requireAuth, caseFollowRulesController.getFollowedReports);

export default router;
