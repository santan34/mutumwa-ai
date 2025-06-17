import { Request, Response } from "express";
import { TenantService, TenantServiceError } from "../services/tenant.service";
import { EntityManager } from "@mikro-orm/core";


interface RequestWithEm extends Request {
  em: EntityManager;
}

export const TenantController = {
  getAll: async (req: RequestWithEm, res: Response) => {
    try {
      const tenants = await TenantService.getAll(req.em);
      return res.status(200).json({ status: "success", data: tenants });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error instanceof Error ? error.message : "Internal server error" });
    }
  },

  create: async (req: RequestWithEm, res: Response) => {
    try {
      const tenant = await TenantService.create(req.em, req.body);
      return res.status(201).json({ status: "success", data: tenant });
    } catch (error) {
      if (error instanceof TenantServiceError) {
        return res.status(400).json({ status: "error", message: error.message });
      }
      return res.status(500).json({ status: "error", message: "Internal server error" });
    }
  },

  getById: async (req: RequestWithEm, res: Response) => {
    try {
      const tenant = await TenantService.getById(req.em, req.params.id);
      return res.status(200).json({ status: "success", data: tenant });
    } catch (error) {
      if (error instanceof TenantServiceError) {
        return res.status(404).json({ status: "error", message: error.message });
      }
      return res.status(500).json({ status: "error", message: "Internal server error" });
    }
  },

  update: async (req: RequestWithEm, res: Response) => {
    try {
      const tenant = await TenantService.update(req.em, req.params.id, req.body);
      return res.status(200).json({ status: "success", data: tenant });
    } catch (error) {
      if (error instanceof TenantServiceError) {
        return res.status(404).json({ status: "error", message: error.message });
      }
      return res.status(500).json({ status: "error", message: "Internal server error" });
    }
  },

  softDelete: async (req: RequestWithEm, res: Response) => {
    try {
      await TenantService.softDelete(req.em, req.params.id);
      return res.status(200).json({ status: "success", message: "Tenant deleted successfully" });
    } catch (error) {
      if (error instanceof TenantServiceError) {
        return res.status(404).json({ status: "error", message: error.message });
      }
      return res.status(500).json({ status: "error", message: "Internal server error" });
    }
  },

  activate: async (req: RequestWithEm, res: Response) => {
    try {
      const tenant = await TenantService.activate(req.em, req.params.id);
      return res.status(200).json({ status: "success", data: tenant });
    } catch (error) {
      if (error instanceof TenantServiceError) {
        return res.status(404).json({ status: "error", message: error.message });
      }
      return res.status(500).json({ status: "error", message: "Internal server error" });
    }
  },

  getSoftDeleted: async (req: RequestWithEm, res: Response) => {
    try {
      const tenants = await TenantService.getSoftDeleted(req.em);
      return res.status(200).json({ status: "success", data: tenants });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error instanceof Error ? error.message : "Internal server error" });
    }
  },
};
