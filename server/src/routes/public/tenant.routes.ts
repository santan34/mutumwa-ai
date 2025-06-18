import { Router } from "express";
import { RequestHandler, Request, Response } from "express";
import { EntityManager } from "@mikro-orm/core";

const router = Router();

interface RequestWithEm extends Request {
  em: EntityManager;
}

const wrapController = (
  fn: (req: RequestWithEm, res: Response) => Promise<Response | void>
): RequestHandler => {
  return async (req, res, next) => {
    try {
      await fn(req as RequestWithEm, res);
    } catch (error) {
      next(error);
    }
  };
};

export const tenantRoutes = router;
