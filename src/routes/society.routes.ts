import { Router } from "express";
import { authenticateJwt } from "../middleware/auth.middleware.js";
import { requireRoles } from "../middleware/role.middleware.js";
import {
  requireSocietyAccess,
  requireSocietySuperAdmin,
} from "../middleware/societyAccess.middleware.js";
import * as societyController from "../controllers/society.controller.js";
import * as billingController from "../controllers/billing.controller.js";
import * as onboardingController from "../controllers/onboarding.controller.js";
import * as propertyController from "../controllers/property.controller.js";
import * as familyController from "../controllers/family.controller.js";
import * as transferController from "../controllers/transfer.controller.js";
import * as residentSetupController from "../controllers/residentSetup.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { maintenanceDashboardQuerySchema } from "../validators/billing.validator.js";

const router = Router({ mergeParams: true });

router.use(authenticateJwt, requireSocietyAccess);

router.get("/overview", societyController.getOverview);

router.get("/onboarding/status", requireRoles("SUPER_ADMIN"), onboardingController.getOnboardingStatus);
router.get("/residency/flow-status", requireRoles("SUPER_ADMIN"), residentSetupController.getFlowStatus);
router.post("/onboarding/skip-residency", requireRoles("SUPER_ADMIN"), onboardingController.skipResidency);
router.patch("/members/me/residency", requireRoles("SUPER_ADMIN"), onboardingController.assignResidency);
router.post(
  "/members/me/complete-residency",
  requireRoles("SUPER_ADMIN"),
  residentSetupController.completeSuperAdminResidency,
);
router.post(
  "/members/complete",
  requireRoles("SUPER_ADMIN", "ADMIN"),
  residentSetupController.completeResident,
);
router.get(
  "/properties/search",
  requireRoles("SUPER_ADMIN", "ADMIN"),
  residentSetupController.searchProperties,
);

router.get("/properties", requireRoles("SUPER_ADMIN", "ADMIN"), propertyController.listProperties);
router.get("/properties/:propertyId", requireRoles("SUPER_ADMIN", "ADMIN"), propertyController.getProperty);
router.get("/properties/:propertyId/view", requireRoles("SUPER_ADMIN", "ADMIN"), propertyController.getPropertyView);
router.get(
  "/properties/:propertyId/residents",
  requireRoles("SUPER_ADMIN", "ADMIN"),
  propertyController.getPropertyResidents,
);
router.get(
  "/properties/:propertyId/history",
  requireRoles("SUPER_ADMIN", "ADMIN"),
  propertyController.getPropertyHistory,
);

router.post("/families", requireRoles("SUPER_ADMIN", "ADMIN", "MEMBER"), familyController.createMyFamily);
router.get("/families/me", requireRoles("SUPER_ADMIN", "ADMIN", "MEMBER"), familyController.getMyFamily);
router.get("/families", requireRoles("SUPER_ADMIN", "ADMIN"), familyController.listFamiliesByProperty);
router.post(
  "/families/:familyId/members",
  requireRoles("SUPER_ADMIN", "ADMIN", "MEMBER"),
  familyController.addFamilyMember,
);
router.delete(
  "/family-members/:familyMemberId",
  requireRoles("SUPER_ADMIN", "ADMIN", "MEMBER"),
  familyController.deleteFamilyMember,
);

router.post("/members/owner", requireRoles("SUPER_ADMIN", "ADMIN"), transferController.postAddOwner);
router.post("/members/tenant", requireRoles("SUPER_ADMIN", "ADMIN"), transferController.postAddTenant);
router.post("/transfers/tenant", requireRoles("SUPER_ADMIN"), transferController.postTransferTenant);
router.post("/transfers/owner", requireRoles("SUPER_ADMIN"), transferController.postTransferOwner);

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
