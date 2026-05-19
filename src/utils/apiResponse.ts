import type { Response } from "express";

export function sendSuccess<T>(res: Response, data: T, status = 200, message?: string) {
  res.status(status).json({
    success: true,
    data,
    ...(message ? { message } : {}),
  });
}

export function sendFailure(res: Response, message: string, status = 400, errors?: unknown) {
  res.status(status).json({
    success: false,
    message,
    ...(errors !== undefined ? { errors } : {}),
  });
}
