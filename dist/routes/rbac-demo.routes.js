import { Router } from "express";
import { authenticateJwt } from "../middleware/auth.middleware.js";
import { requireRoles } from "../middleware/role.middleware.js";
const router = Router();
router.get("/super-admin-only", authenticateJwt, requireRoles("SUPER_ADMIN"), (_req, res) => {
    res.json({ success: true, message: "Super admin access granted" });
});
router.get("/admin-team", authenticateJwt, requireRoles("SUPER_ADMIN", "ADMIN"), (_req, res) => {
    res.json({ success: true, message: "Admin-level access granted" });
});
export default router;
//# sourceMappingURL=rbac-demo.routes.js.map