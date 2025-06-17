import { Request, Response } from "express";
import { PlanService, PlanServiceError } from "../services/plan.service";
import { EntityManager } from "@mikro-orm/core";

interface RequestWithEm extends Request {
  em: EntityManager;
}

export const PlanController = {
  getAll: async (req: RequestWithEm, res: Response) => {
    try {
      const plans = await PlanService.getAll(req.em);
      return res.status(200).json({
        status: "success",
        data: plans,
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
      const plan = await PlanService.create(req.em, req.body);
      return res.status(201).json({
        status: "success",
        data: plan,
      });
    } catch (error) {
      if (error instanceof PlanServiceError) {
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
      const plan = await PlanService.getById(req.em, req.params.id);
      return res.status(200).json({
        status: "success",
        data: plan,
      });
    } catch (error) {
      if (error instanceof PlanServiceError) {
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
      const plan = await PlanService.update(req.em, req.params.id, req.body);
      return res.status(200).json({
        status: "success",
        data: plan,
      });
    } catch (error) {
      if (error instanceof PlanServiceError) {
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
      await PlanService.delete(req.em, req.params.id);
      return res.status(200).json({
        status: "success",
        message: "Plan deleted successfully",
      });
    } catch (error) {
      if (error instanceof PlanServiceError) {
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
