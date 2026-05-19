import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";
import { sendFailure } from "../utils/apiResponse.js";

type RequestSource = "body" | "query" | "params";

export function validate<T>(schema: ZodSchema<T>, source: RequestSource = "body"): RequestHandler {
  return (req, res, next) => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
      sendFailure(res, "Validation failed", 400, parsed.error.flatten());
      return;
    }
    req[source] = parsed.data;
    next();
  };
}
