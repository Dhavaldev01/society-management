export function requireRoles(...allowed) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        if (!allowed.includes(req.user.role)) {
            res.status(403).json({ success: false, message: "Forbidden: insufficient role" });
            return;
        }
        next();
    };
}
//# sourceMappingURL=role.middleware.js.map