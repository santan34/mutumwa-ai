import { Request, Response, NextFunction } from "express";
import { Schema } from "joi";

export const validateRequest = (
  schema: Schema,
  property: "body" | "query" | "params" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[property], { abortEarly: false });

    if (!error) return next();

    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({
      status: "error",
      message: "Invalid request data",
      errors,
    });
  };
};
