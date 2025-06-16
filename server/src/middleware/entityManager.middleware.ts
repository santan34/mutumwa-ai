import { Request, Response, NextFunction } from "express";
import { EntityManager, RequestContext } from "@mikro-orm/core";
import { orm } from "../config/database"; // Adjust the import path as necessary

export const entityManagerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  RequestContext.create(orm.em, () => {
    (req as any).em = orm.em.fork();
    next();
  });
};
