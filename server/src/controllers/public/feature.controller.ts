import { Request, Response } from "express";
import {
  FeatureService,
  FeatureServiceError,
} from "../../services/public/feature.service";
import { EntityManager } from "@mikro-orm/core";

interface RequestWithEm extends Request {
  em: EntityManager;
}

export const FeatureController = {
  getAll: async (req: RequestWithEm, res: Response) => {
    try {
      const features = await FeatureService.getAll(req.em);
      return res.status(200).json({
        status: "success",
        data: features,
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
      const feature = await FeatureService.create(req.em, req.body);
      return res.status(201).json({
        status: "success",
        data: feature,
      });
    } catch (error) {
      if (error instanceof FeatureServiceError) {
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
      const feature = await FeatureService.getById(req.em, req.params.id);
      return res.status(200).json({
        status: "success",
        data: feature,
      });
    } catch (error) {
      if (error instanceof FeatureServiceError) {
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
      const feature = await FeatureService.update(
        req.em,
        req.params.id,
        req.body
      );
      return res.status(200).json({
        status: "success",
        data: feature,
      });
    } catch (error) {
      if (error instanceof FeatureServiceError) {
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
      await FeatureService.softDelete(req.em, req.params.id);
      return res.status(200).json({
        status: "success",
        message: "Feature deleted successfully",
      });
    } catch (error) {
      if (error instanceof FeatureServiceError) {
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
