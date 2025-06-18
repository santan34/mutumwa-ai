import { Request, Response } from "express";
import { EntityManager } from "@mikro-orm/core";
import {
  PlanFeatureService,
  PlanFeatureServiceError,
} from "../../services/public/planFeatures.service";

interface RequestWithEm extends Request {
  em: EntityManager;
}

export const PlanFeatureController = {
  getAll: async (req: RequestWithEm, res: Response) => {
    try {
      const planFeatures = await PlanFeatureService.getAll(req.em);
      return res.status(200).json({
        status: "success",
        data: planFeatures,
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
      const planFeature = await PlanFeatureService.create(req.em, req.body);
      return res.status(201).json({
        status: "success",
        data: planFeature,
      });
    } catch (error) {
      if (error instanceof PlanFeatureServiceError) {
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

  getByIds: async (req: RequestWithEm, res: Response) => {
    try {
      const planFeature = await PlanFeatureService.getByIds(
        req.em,
        req.params.planId,
        req.params.featureId
      );
      return res.status(200).json({
        status: "success",
        data: planFeature,
      });
    } catch (error) {
      if (error instanceof PlanFeatureServiceError) {
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
      const planFeature = await PlanFeatureService.update(
        req.em,
        req.params.planId,
        req.params.featureId,
        req.body
      );
      return res.status(200).json({
        status: "success",
        data: planFeature,
      });
    } catch (error) {
      if (error instanceof PlanFeatureServiceError) {
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
      await PlanFeatureService.delete(
        req.em,
        req.params.planId,
        req.params.featureId
      );
      return res.status(204).send();
    } catch (error) {
      if (error instanceof PlanFeatureServiceError) {
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