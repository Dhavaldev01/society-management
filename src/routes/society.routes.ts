import { Router } from "express";
import { authenticateJwt } from "../middleware/auth.middleware.js";
import { requireRoles } from "../middleware/role.middleware.js";
import {
  requireSocietyAccess,
  requireSocietySuperAdmin,
} from "../middleware/societyAccess.middleware.js";
import * as societyController from "../controllers/society.controller.js";
import * as billingController from "../controllers/billing.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { maintenanceDashboardQuerySchema } from "../validators/billing.validator.js";

const router = Router({ mergeParams: true });

router.use(authenticateJwt, requireSocietyAccess);

router.get("/overview", societyController.getOverview);

router.get(
  "/billing/dashboard",
  requireRoles("SUPER_ADMIN", "ADMIN"),
  validate(maintenanceDashboardQuerySchema, "query"),
  billingController.getMaintenanceDashboard,
);

router.get(
  "/billing/units",
  requireRoles("SUPER_ADMIN", "ADMIN"),
  validate(maintenanceDashboardQuerySchema, "query"),
  billingController.getBlockWingBillingDetails,
);

/** Blocks/wings live on the society document (`society.units[]`) */
router.post("/units", requireSocietySuperAdmin, requireRoles("SUPER_ADMIN"), societyController.createUnit);
router.get("/units", societyController.listUnits);
router.put(
  "/units/:unitId",
  requireSocietySuperAdmin,
  requireRoles("SUPER_ADMIN"),
  societyController.updateUnit,
);
router.delete(
  "/units/:unitId",
  requireSocietySuperAdmin,
  requireRoles("SUPER_ADMIN"),
  societyController.deleteUnit,
);

router.post("/admins", requireSocietySuperAdmin, requireRoles("SUPER_ADMIN"), societyController.assignAdmin);
router.get("/admins", requireRoles("SUPER_ADMIN", "ADMIN"), societyController.listAdmins);

router.post("/members", requireRoles("SUPER_ADMIN", "ADMIN"), societyController.createMember);
router.get("/members", requireRoles("SUPER_ADMIN", "ADMIN"), societyController.listMembers);
router.get(
  "/members/pending",
  requireSocietySuperAdmin,
  requireRoles("SUPER_ADMIN"),
  societyController.listPendingMembers,
);
router.post(
  "/members/:memberId/approve",
  requireSocietySuperAdmin,
  requireRoles("SUPER_ADMIN"),
  societyController.approveMember,
);
router.post(
  "/members/:memberId/reject",
  requireSocietySuperAdmin,
  requireRoles("SUPER_ADMIN"),
  societyController.rejectMember,
);

router.post("/change-requests", requireRoles("SUPER_ADMIN", "ADMIN"), societyController.submitChangeRequest);
router.get(
  "/change-requests",
  requireRoles("SUPER_ADMIN", "ADMIN"),
  societyController.listChangeRequests,
);
router.post(
  "/change-requests/:requestId/review",
  requireSocietySuperAdmin,
  requireRoles("SUPER_ADMIN"),
  societyController.reviewChangeRequest,
);

export default router;
