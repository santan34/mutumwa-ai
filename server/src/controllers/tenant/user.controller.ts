import { Request, Response } from "express";
import { UserService, UserServiceError } from "../../services/tenant/user.service";
import { EntityManager } from "@mikro-orm/core";

interface RequestWithEm extends Request {
  em: EntityManager;
}

export const UserController = {
  getAll: async (req: RequestWithEm, res: Response) => {
    try {
      const users = await UserService.getAll(req.em);
      return res.status(200).json({
        status: "success",
        data: users,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error instanceof Error ? error.message : "Internal server error",
      });
    }
  },

  create: async (req: RequestWithEm, res: Response) => {
    try {
      const user = await UserService.create(req.em, req.body);
      return res.status(201).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      if (error instanceof UserServiceError) {
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
      const user = await UserService.getById(req.em, req.params.id);
      return res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      if (error instanceof UserServiceError) {
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
      const user = await UserService.update(req.em, req.params.id, req.body);
      return res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      if (error instanceof UserServiceError) {
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

  delete: async (req: RequestWithEm, res: Response) => {
    try {
      const user = await UserService.softDelete(req.em, req.params.id);
      return res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      if (error instanceof UserServiceError) {
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

  restore: async (req: RequestWithEm, res: Response) => {
    try {
      const user = await UserService.restore(req.em, req.params.id);
      return res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      if (error instanceof UserServiceError) {
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

  permanentDelete: async (req: RequestWithEm, res: Response) => {
    try {
      await UserService.permanentDelete(req.em, req.params.id);
      return res.status(200).json({
        status: "success",
        message: "User permanently deleted",
      });
    } catch (error) {
      if (error instanceof UserServiceError) {
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