import type { NextFunction, Request, Response } from "express";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const message = err instanceof Error ? err.message : "Internal server error";
  const status =
    err instanceof Error && "statusCode" in err && typeof (err as { statusCode?: number }).statusCode === "number"
      ? (err as { statusCode: number }).statusCode
      : 500;

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message,
  });
}
