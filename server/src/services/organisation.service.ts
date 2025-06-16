// services/organisation.service.ts
import { EntityManager } from "@mikro-orm/core";
import { Organisation } from "../entities/public/Organisation";

export class OrganisationServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrganisationServiceError";
  }
}

interface CreateOrganisationData {
  name: string;
  domain: string;
  sector?: string;
}

export const OrganisationService = {
  getAll: async (em: EntityManager): Promise<Organisation[]> => {
    try {
      return await em.find(Organisation, { deletedAt: null });
    } catch (error) {
      throw new OrganisationServiceError(
        `Failed to fetch organisations: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  create: async (
    em: EntityManager,
    data: CreateOrganisationData
  ): Promise<Organisation> => {
    try {
      const org = em.create(Organisation, {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await em.persistAndFlush(org);
      return org;
    } catch (error) {
      if (error instanceof Error && error.message.includes("duplicate key")) {
        throw new OrganisationServiceError(
          "An organisation with this domain already exists"
        );
      }
      throw new OrganisationServiceError(
        `Failed to create organisation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  getById: async (em: EntityManager, id: string): Promise<Organisation> => {
    try {
      const org = await em.findOne(Organisation, { id });
      if (!org)
        throw new OrganisationServiceError(
          `Organisation with id ${id} not found`
        );
      return org;
    } catch (error) {
      throw new OrganisationServiceError(
        `Failed to fetch organisation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  update: async (
    em: EntityManager,
    id: string,
    data: Partial<Organisation>
  ): Promise<Organisation> => {
    try {
      const org = await OrganisationService.getById(em, id);
      em.assign(org, { ...data, updatedAt: new Date() });
      await em.flush();
      return org;
    } catch (error) {
      throw new OrganisationServiceError(
        `Failed to update organisation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  softDelete: async (em: EntityManager, id: string): Promise<Organisation> => {
    return OrganisationService.update(em, id, { deletedAt: new Date() });
  },

  activate: async (em: EntityManager, id: string): Promise<Organisation> => {
    return OrganisationService.update(em, id, { deletedAt: null });
  },

  getSoftDeleted: async (em: EntityManager): Promise<Organisation[]> => {
    try {
      return await em.find(Organisation, { deletedAt: { $ne: null } });
    } catch (error) {
      throw new OrganisationServiceError(
        `Failed to fetch deleted organisations: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
};
