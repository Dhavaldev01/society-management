export function errorHandler(err, _req, res, _next) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status = err instanceof Error && "statusCode" in err && typeof err.statusCode === "number"
        ? err.statusCode
        : 500;
    if (status >= 500) {
        console.error(err);
    }
    res.status(status).json({
        success: false,
        message,
    });
}
//# sourceMappingURL=error.middleware.js.map