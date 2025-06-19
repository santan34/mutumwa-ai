import { Request, Response } from "express";
import { EntityManager } from "@mikro-orm/core";
import { ApiUsageService, ApiUsageServiceError } from "../../services/public/apiUsage.service";

interface RequestWithEm extends Request {
  em: EntityManager;
}

export const ApiUsageController = {
  getAll: async (req: RequestWithEm, res: Response) => {
    try {
      const usage = await ApiUsageService.getAll(req.em);
      return res.status(200).json({
        status: "success",
        data: usage,
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
      const usage = await ApiUsageService.create(req.em, req.body);
      return res.status(201).json({
        status: "success",
        data: usage,
      });
    } catch (error) {
      if (error instanceof ApiUsageServiceError) {
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

  getByKeys: async (req: RequestWithEm, res: Response) => {
    try {
      const usage = await ApiUsageService.getByKeys(
        req.em,
        req.params.organisationId,
        req.params.featureId,
        new Date(req.params.periodStart)
      );
      return res.status(200).json({
        status: "success",
        data: usage,
      });
    } catch (error) {
      if (error instanceof ApiUsageServiceError) {
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
      const usage = await ApiUsageService.update(
        req.em,
        req.params.organisationId,
        req.params.featureId,
        new Date(req.params.periodStart),
        req.body
      );
      return res.status(200).json({
        status: "success",
        data: usage,
      });
    } catch (error) {
      if (error instanceof ApiUsageServiceError) {
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

  incrementUsage: async (req: RequestWithEm, res: Response) => {
    try {
      const usage = await ApiUsageService.incrementUsage(
        req.em,
        req.params.organisationId,
        req.params.featureId,
        new Date(req.params.periodStart)
      );
      return res.status(200).json({
        status: "success",
        data: usage,
      });
    } catch (error) {
      if (error instanceof ApiUsageServiceError) {
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