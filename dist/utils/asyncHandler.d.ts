import type { RequestHandler } from "express";
/** Wraps async route handlers so errors propagate to Express error middleware */
export declare function asyncHandler(fn: RequestHandler): RequestHandler;
//# sourceMappingURL=asyncHandler.d.ts.map