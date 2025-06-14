import { prisma } from "../../prisma/client";
import { IOrganisation } from "../interfaces/organisation.interface";
import { Prisma } from "../../generated/prisma";

export class OrganisationServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrganisationServiceError";
  }
}

export const OrganisationService = {
  getAll: async (): Promise<IOrganisation[]> => {
    try {
      return await prisma.organisation.findMany({
        where: { deletedAt: null },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new OrganisationServiceError(
        `Failed to fetch organisations: ${message}`
      );
    }
  },

  create: async (data: IOrganisation): Promise<IOrganisation> => {
    try {
      return await prisma.organisation.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new OrganisationServiceError(
            "An organisation with this name already exists"
          );
        }
      }
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new OrganisationServiceError(
        `Failed to create organisation: ${message}`
      );
    }
  },

  getById: async (id: string): Promise<IOrganisation> => {
    try {
      const organisation = await prisma.organisation.findFirst({
        where: { id, deletedAt: null },
      });

      if (!organisation) {
        throw new OrganisationServiceError(
          `Organisation with id ${id} not found`
        );
      }

      return organisation;
    } catch (error) {
      if (error instanceof OrganisationServiceError) throw error;
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new OrganisationServiceError(
        `Failed to fetch organisation: ${message}`
      );
    }
  },

  update: async (
    id: string,
    data: Partial<IOrganisation>
  ): Promise<IOrganisation> => {
    try {
      return await prisma.organisation.update({
        where: { id, deletedAt: null },
        // Ensure we only update fields of active organisations
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new OrganisationServiceError(
            `Organisation with id ${id} not found`
          );
        }
      }
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new OrganisationServiceError(
        `Failed to update organisation: ${message}`
      );
    }
  },

  softDelete: async (id: string): Promise<IOrganisation> => {
    try {
      return await prisma.organisation.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new OrganisationServiceError(
            `Organisation with id ${id} not found`
          );
        }
      }
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new OrganisationServiceError(
        `Failed to delete organisation: ${message}`
      );
    }
  },

  activate: async (id: string): Promise<IOrganisation> => {
    try {
      return await prisma.organisation.update({
        where: { id },
        data: { deletedAt: null },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new OrganisationServiceError(
            `Organisation with id ${id} not found`
          );
        }
      }
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new OrganisationServiceError(
        `Failed to activate organisation: ${message}`
      );
    }
  },

  getSoftDeleted: async (): Promise<IOrganisation[]> => {
    try {
      return await prisma.organisation.findMany({
        where: {
          deletedAt: {
            not: null,
          },
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new OrganisationServiceError(
        `Failed to fetch deleted organisations: ${message}`
      );
    }
  },
};
