import { Router } from "express";
import authRoutes from "./auth.routes.js";
import rbacDemoRoutes from "./rbac-demo.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/demo", rbacDemoRoutes);

router.get("/health", (_req, res) => {
  res.json({ ok: true });
});

export default router;
