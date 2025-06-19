import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Rate limit errors
  if (err.message.includes("Rate limit exceeded")) {
    return res.status(429).json({
      error: "Too Many Requests",
      message: err.message,
      retryAfter: err.msBeforeNext / 1000,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid token",
    });
  }

  // Default error
  console.error(err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
};
