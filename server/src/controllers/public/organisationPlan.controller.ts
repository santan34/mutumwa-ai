import { Request, Response } from "express";
import { EntityManager } from "@mikro-orm/core";
import { OrganisationPlanService, OrganisationPlanServiceError } from "../../services/public/organisationPlan.service";

interface RequestWithEm extends Request {
  em: EntityManager;
}

export const OrganisationPlanController = {
  getAll: async (req: RequestWithEm, res: Response) => {
    try {
      const organisationPlans = await OrganisationPlanService.getAll(req.em);
      return res.status(200).json({
        status: "success",
        data: organisationPlans,
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
      const organisationPlan = await OrganisationPlanService.create(req.em, req.body);
      return res.status(201).json({
        status: "success",
        data: organisationPlan,
      });
    } catch (error) {
      if (error instanceof OrganisationPlanServiceError) {
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
      const organisationPlan = await OrganisationPlanService.getById(req.em, req.params.id);
      return res.status(200).json({
        status: "success",
        data: organisationPlan,
      });
    } catch (error) {
      if (error instanceof OrganisationPlanServiceError) {
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
      const organisationPlan = await OrganisationPlanService.update(
        req.em,
        req.params.id,
        req.body
      );
      return res.status(200).json({
        status: "success",
        data: organisationPlan,
      });
    } catch (error) {
      if (error instanceof OrganisationPlanServiceError) {
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
      await OrganisationPlanService.softDelete(req.em, req.params.id);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof OrganisationPlanServiceError) {
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
  }
};