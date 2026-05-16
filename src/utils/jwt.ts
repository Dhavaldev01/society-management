import jwt, { type SignOptions } from "jsonwebtoken";
import type { Role } from "../types/roles.js";
import { env } from "../config/env.js";

export type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
};

export function signAccessToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    subject: payload.sub,
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  return decoded;
}
