import { Router } from "express";
import authRoutes from "./auth.routes.js";
import rbacDemoRoutes from "./rbac-demo.routes.js";
import societyRoutes from "./society.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/societies/:societyId", societyRoutes);
router.use("/demo", rbacDemoRoutes);

router.get("/health", (_req, res) => {
  res.json({ ok: true });
});

export default router;
