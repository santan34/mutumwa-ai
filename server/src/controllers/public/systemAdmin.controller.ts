import { Request, Response } from "express";
import {
  SystemAdminService,
  SystemAdminServiceError,
} from "../../services/public/systemAdmin.service";
import { EntityManager } from "@mikro-orm/core";

interface RequestWithEm extends Request {
  em: EntityManager;
}

export const SystemAdminController = {
  getAll: async (req: RequestWithEm, res: Response) => {
    try {
      const admins = await SystemAdminService.getAll(req.em);
      return res.status(200).json({
        status: "success",
        data: admins,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  },

  create: async (req: RequestWithEm, res: Response) => {
    try {
      const admin = await SystemAdminService.create(req.em, req.body);
      return res.status(201).json({
        status: "success",
        data: admin,
      });
    } catch (error) {
      if (error instanceof SystemAdminServiceError) {
        return res.status(400).json({
          status: "error",
          message: error.message,
        });
      }
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  getById: async (req: RequestWithEm, res: Response) => {
    try {
      const admin = await SystemAdminService.getById(req.em, req.params.id);
      return res.status(200).json({
        status: "success",
        data: admin,
      });
    } catch (error) {
      if (error instanceof SystemAdminServiceError) {
        return res.status(404).json({
          status: "error",
          message: error.message,
        });
      }
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  update: async (req: RequestWithEm, res: Response) => {
    try {
      const admin = await SystemAdminService.update(
        req.em,
        req.params.id,
        req.body
      );
      return res.status(200).json({
        status: "success",
        data: admin,
      });
    } catch (error) {
      if (error instanceof SystemAdminServiceError) {
        return res.status(404).json({
          status: "error",
          message: error.message,
        });
      }
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  toggleActive: async (req: RequestWithEm, res: Response) => {
    try {
      const admin = await SystemAdminService.toggleActive(
        req.em,
        req.params.id
      );
      return res.status(200).json({
        status: "success",
        data: admin,
      });
    } catch (error) {
      if (error instanceof SystemAdminServiceError) {
        return res.status(404).json({
          status: "error",
          message: error.message,
        });
      }
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },
};
