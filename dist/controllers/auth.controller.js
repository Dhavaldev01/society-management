import { loginSchema, registerSchema, registerSocietySchema } from "../validators/auth.validator.js";
import * as authService from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
export const register = asyncHandler(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, message: "Validation failed", errors: parsed.error.flatten() });
        return;
    }
    const { user, token } = await authService.registerUser(parsed.data);
    res.status(201).json({
        success: true,
        data: { user, token },
    });
});
export const registerSociety = asyncHandler(async (req, res) => {
    const parsed = registerSocietySchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, message: "Validation failed", errors: parsed.error.flatten() });
        return;
    }
    const { user, token } = await authService.registerSocietyAdmin(parsed.data);
    res.status(201).json({ success: true, data: { user, token } });
});
export const login = asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, message: "Validation failed", errors: parsed.error.flatten() });
        return;
    }
    const { user, token } = await authService.loginUser(parsed.data);
    res.json({
        success: true,
        data: { user, token },
    });
});
export const me = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
    const user = await authService.getUserById(userId);
    if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
    }
    res.json({ success: true, data: { user } });
});
//# sourceMappingURL=auth.controller.js.map