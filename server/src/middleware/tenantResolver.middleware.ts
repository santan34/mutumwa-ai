import { Request, Response, NextFunction } from "express";
import { orm } from "../config/database";
import { Organisation } from "../entities/public/Organisation";

export const tenantResolverMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const domain = req.headers.host || "";

    if (!domain) throw new Error("Missing domain");

    const baseEm = orm.em.fork();
    const org = await baseEm.findOne(Organisation, { domain });

    if (!org) {
      req.em = baseEm;
      return next();
    }

    const tenantSchema = `tenant_${org.id}`.replace(/[^a-z0-9_]/gi, "");
    const tenantEm = orm.em.fork();
    await tenantEm
      .getConnection()
      .execute(`SET search_path TO ${tenantSchema}, public`);

    req.em = tenantEm;
    req.tenant = org;

    next();
  } catch (err) {
    next(err);
  }
};
