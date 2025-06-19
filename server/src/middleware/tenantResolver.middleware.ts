import { Request, Response, NextFunction } from "express";
import { orm } from "../config/database";
import { Organisation } from "../entities/public/Organisation";

export const tenantResolverMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Change this line to use lowercase header name
    const domain = req.headers["x-tenant-domain"] as string;
    if (!domain) {
      req.em = orm.em.fork();
      return next();
    }

    const baseEm = orm.em.fork();
    const org = await baseEm.findOne(Organisation, { domain });

    if (!org) {
      throw new Error("Organisation not found for this domain");
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
