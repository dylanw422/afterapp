import type { Request, Response, NextFunction } from "express";

// Not found middleware
export const notFoundHandler = (req: Request, res: Response) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({
      status: "error",
      message: `Route ${req.method} ${req.path} not found`,
    });
  }

  // For non-API routes, let the frontend handle 404s
  return res.status(404).sendFile("index.html");
};

// Global error handler
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("Server error:", err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  if (req.path.startsWith("/api")) {
    return res.status(statusCode).json({
      status: "error",
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
  }

  // For non-API routes with errors
  return res.status(statusCode).send("Server Error");
};
