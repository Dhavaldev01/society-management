import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticateJwt } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { loginSchema, registerSchema, registerSocietySchema } from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/register-society", validate(registerSocietySchema), authController.registerSociety);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authenticateJwt, authController.me);

export default router;
