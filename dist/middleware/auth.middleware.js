import { verifyAccessToken } from "../utils/jwt.js";
const BEARER_PREFIX = "Bearer ";
export function authenticateJwt(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith(BEARER_PREFIX)) {
        res.status(401).json({ success: false, message: "Missing or invalid Authorization header" });
        return;
    }
    const token = header.slice(BEARER_PREFIX.length).trim();
    if (!token) {
        res.status(401).json({ success: false, message: "Missing token" });
        return;
    }
    try {
        const payload = verifyAccessToken(token);
        req.user = {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
        };
        next();
    }
    catch {
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
}
//# sourceMappingURL=auth.middleware.js.map