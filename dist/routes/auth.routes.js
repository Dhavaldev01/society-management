import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticateJwt } from "../middleware/auth.middleware.js";
const router = Router();
router.post("/register", authController.register);
router.post("/register-society", authController.registerSociety);
router.post("/login", authController.login);
router.get("/me", authenticateJwt, authController.me);
export default router;
//# sourceMappingURL=auth.routes.js.map