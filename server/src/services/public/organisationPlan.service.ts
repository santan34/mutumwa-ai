import { EntityManager } from "@mikro-orm/core";
import { OrganisationPlan } from "../../entities/public/OrganisationPlan";
import { Organisation } from "../../entities/public/Organisation";
import { Plan } from "../../entities/public/Plan";
import { v4 as uuidv4 } from "uuid";

export class OrganisationPlanServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrganisationPlanServiceError";
  }
}

interface CreateOrganisationPlanData {
  organisationId: string;
  planId: string;
  startedAt?: Date;
  expiresAt: Date;
  isActive?: boolean;
}

export const OrganisationPlanService = {
  getAll: async (em: EntityManager): Promise<OrganisationPlan[]> => {
    try {
      return await em.find(
        OrganisationPlan,
        { deletedAt: null },
        { populate: ["organisation", "plan"] }
      );
    } catch (error) {
      throw new OrganisationPlanServiceError(
        `Failed to fetch organisation plans: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  create: async (
    em: EntityManager,
    data: CreateOrganisationPlanData
  ): Promise<OrganisationPlan> => {
    try {
      const organisation = await em.findOne(Organisation, {
        id: data.organisationId,
      });
      const plan = await em.findOne(Plan, { id: data.planId });

      if (!organisation || !plan) {
        throw new OrganisationPlanServiceError(
          "Organisation or Plan not found"
        );
      }

      const organisationPlan = em.create(OrganisationPlan, {
        organisation,
        plan,
        apiKey: uuidv4(),
        startedAt: data.startedAt || new Date(),
        expiresAt: data.expiresAt,
        isActive: data.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await em.persistAndFlush(organisationPlan);
      return organisationPlan;
    } catch (error) {
      throw new OrganisationPlanServiceError(
        `Failed to create organisation plan: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  getById: async (em: EntityManager, id: string): Promise<OrganisationPlan> => {
    try {
      const organisationPlan = await em.findOne(
        OrganisationPlan,
        { id, deletedAt: null },
        { populate: ["organisation", "plan"] }
      );

      if (!organisationPlan) {
        throw new OrganisationPlanServiceError("Organisation plan not found");
      }

      return organisationPlan;
    } catch (error) {
      throw new OrganisationPlanServiceError(
        `Failed to fetch organisation plan: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  update: async (
    em: EntityManager,
    id: string,
    data: Partial<OrganisationPlan>
  ): Promise<OrganisationPlan> => {
    try {
      const organisationPlan = await OrganisationPlanService.getById(em, id);
      em.assign(organisationPlan, data);
      await em.flush();
      return organisationPlan;
    } catch (error) {
      throw new OrganisationPlanServiceError(
        `Failed to update organisation plan: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  softDelete: async (em: EntityManager, id: string): Promise<void> => {
    try {
      const organisationPlan = await OrganisationPlanService.getById(em, id);
      organisationPlan.deletedAt = new Date();
      await em.flush();
    } catch (error) {
      throw new OrganisationPlanServiceError(
        `Failed to delete organisation plan: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  updateApiKeyLastUsed: async (
    em: EntityManager,
    apiKey: string
  ): Promise<OrganisationPlan> => {
    try {
      const organisationPlan = await em.findOne(OrganisationPlan, {
        apiKey,
        deletedAt: null,
      });

      if (!organisationPlan) {
        throw new OrganisationPlanServiceError("Invalid API key");
      }

      organisationPlan.apiKeyLastUsedAt = new Date();
      await em.flush();
      return organisationPlan;
    } catch (error) {
      throw new OrganisationPlanServiceError(
        `Failed to update API key last used: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
};
