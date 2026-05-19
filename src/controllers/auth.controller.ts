import type { Request, Response } from "express";
import type { LoginInput, RegisterInput, RegisterSocietyInput } from "../validators/auth.validator.js";
import * as authService from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendFailure, sendSuccess } from "../utils/apiResponse.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as RegisterInput;
  const { user, token } = await authService.registerUser(body);
  sendSuccess(res, { user, token }, 201);
});

export const registerSociety = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as RegisterSocietyInput;
  const { user, token, onboardingRequired } = await authService.registerSocietyAdmin(body);
  sendSuccess(res, { user, token, onboardingRequired }, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as LoginInput;
  const { user, token } = await authService.loginUser(body);
  sendSuccess(res, { user, token });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    sendFailure(res, "Unauthorized", 401);
    return;
  }

  const user = await authService.getUserById(userId);
  if (!user) {
    sendFailure(res, "User not found", 404);
    return;
  }

  sendSuccess(res, { user });
});
