import { Request, Response } from "express";
import {
  OrganisationService,
  OrganisationServiceError,
} from "../services/organisation.service";

export const OrganisationController = {
  getAll: async (_req: Request, res: Response) => {
    try {
      const organisations = await OrganisationService.getAll();
      return res.status(200).json({
        status: "success",
        data: organisations,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const organisation = await OrganisationService.create(req.body);
      return res.status(201).json({
        status: "success",
        data: organisation,
      });
    } catch (error) {
      if (error instanceof OrganisationServiceError) {
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

  getById: async (req: Request, res: Response) => {
    try {
      const organisation = await OrganisationService.getById(req.params.id);
      return res.status(200).json({
        status: "success",
        data: organisation,
      });
    } catch (error) {
      if (error instanceof OrganisationServiceError) {
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

  update: async (req: Request, res: Response) => {
    try {
      const organisation = await OrganisationService.update(
        req.params.id,
        req.body
      );
      return res.status(200).json({
        status: "success",
        data: organisation,
      });
    } catch (error) {
      if (error instanceof OrganisationServiceError) {
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

  softDelete: async (req: Request, res: Response) => {
    try {
      await OrganisationService.softDelete(req.params.id);
      return res.status(200).json({
        status: "success",
        message: "Organisation deleted successfully",
      });
    } catch (error) {
      if (error instanceof OrganisationServiceError) {
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

  activate: async (req: Request, res: Response) => {
    try {
      const organisation = await OrganisationService.activate(req.params.id);
      return res.status(200).json({
        status: "success",
        data: organisation,
      });
    } catch (error) {
      if (error instanceof OrganisationServiceError) {
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

  getSoftDeleted: async (_req: Request, res: Response) => {
    try {
      const organisations = await OrganisationService.getSoftDeleted();
      return res.status(200).json({
        status: "success",
        data: organisations,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  },
};
