import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export function signAccessToken(payload) {
    const options = {
        expiresIn: env.JWT_EXPIRES_IN,
        subject: payload.sub,
    };
    return jwt.sign(payload, env.JWT_SECRET, options);
}
export function verifyAccessToken(token) {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return decoded;
}
//# sourceMappingURL=jwt.js.map