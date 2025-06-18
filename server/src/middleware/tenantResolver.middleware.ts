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

    const tenantSchema = `tenant_${org.id}`;
    const tenantEm = orm.em.fork();

    // Explicitly set search path for this connection
    await tenantEm.getConnection().execute(`
      SET search_path TO "${tenantSchema}", public;
      SET statement_timeout = 0;
    `);

    // Set schema on EntityManager configuration
    tenantEm.config.set("schema", tenantSchema);

    req.em = tenantEm;
    req.tenant = org;

    next();
  } catch (err) {
    next(err);
  }
};
