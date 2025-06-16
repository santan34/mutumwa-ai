import { Request, Response } from "express";
import {
  OrganisationService,
  OrganisationServiceError,
} from "../services/organisation.service";
import { EntityManager } from "@mikro-orm/core";

// Add a RequestWithEm interface to extend the Express Request
interface RequestWithEm extends Request {
  em: EntityManager;
}

export const OrganisationController = {
  getAll: async (req: RequestWithEm, res: Response) => {
    try {
      const organisations = await OrganisationService.getAll(req.em);
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

  create: async (req: RequestWithEm, res: Response) => {
    try {
      const organisation = await OrganisationService.create(req.em, req.body);
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

  getById: async (req: RequestWithEm, res: Response) => {
    try {
      const organisation = await OrganisationService.getById(
        req.em,
        req.params.id
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

  update: async (req: RequestWithEm, res: Response) => {
    try {
      const organisation = await OrganisationService.update(
        req.em,
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

  softDelete: async (req: RequestWithEm, res: Response) => {
    try {
      await OrganisationService.softDelete(req.em, req.params.id);
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

  activate: async (req: RequestWithEm, res: Response) => {
    try {
      const organisation = await OrganisationService.activate(
        req.em,
        req.params.id
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

  getSoftDeleted: async (req: RequestWithEm, res: Response) => {
    try {
      const organisations = await OrganisationService.getSoftDeleted(req.em);
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
