import { Request, Response } from "express";
import { EntityManager } from "@mikro-orm/core";
import {
  WorkspacePermissionService,
  WorkspacePermissionServiceError,
} from "../../services/public/workspacePermission.service";

interface RequestWithEm extends Request {
  em: EntityManager;
}

export const WorkspacePermissionController = {
  getAll: async (req: RequestWithEm, res: Response) => {
    try {
      const permissions = await WorkspacePermissionService.getAll(req.em);
      return res.status(200).json({
        status: "success",
        data: permissions,
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
      const permission = await WorkspacePermissionService.create(
        req.em,
        req.body
      );
      return res.status(201).json({
        status: "success",
        data: permission,
      });
    } catch (error) {
      if (error instanceof WorkspacePermissionServiceError) {
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
      const permission = await WorkspacePermissionService.getById(
        req.em,
        req.params.id
      );
      return res.status(200).json({
        status: "success",
        data: permission,
      });
    } catch (error) {
      if (error instanceof WorkspacePermissionServiceError) {
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
      const permission = await WorkspacePermissionService.update(
        req.em,
        req.params.id,
        req.body
      );
      return res.status(200).json({
        status: "success",
        data: permission,
      });
    } catch (error) {
      if (error instanceof WorkspacePermissionServiceError) {
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

  softDelete: async (req: RequestWithEm, res: Response) => {
    try {
      await WorkspacePermissionService.softDelete(req.em, req.params.id);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof WorkspacePermissionServiceError) {
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
