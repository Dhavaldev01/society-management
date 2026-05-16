import type { RequestHandler } from "express";

/** Wraps async route handlers so errors propagate to Express error middleware */
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
