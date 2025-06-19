import { EntityManager } from "@mikro-orm/core";
import { Plan } from "../../entities/public/Plan";

export class PlanServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlanServiceError";
  }
}

interface CreatePlanData {
  name: string;
  description: string;
}

export const PlanService = {
  getAll: async (em: EntityManager): Promise<Plan[]> => {
    try {
      return await em.find(Plan, {});
    } catch (error) {
      throw new PlanServiceError(
        `Failed to fetch plans: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  create: async (em: EntityManager, data: CreatePlanData): Promise<Plan> => {
    try {
      const plan = em.create(Plan, {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await em.persistAndFlush(plan);
      return plan;
    } catch (error) {
      if (error instanceof Error && error.message.includes("duplicate key")) {
        throw new PlanServiceError("A plan with this name already exists");
      }
      throw new PlanServiceError(
        `Failed to create plan: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  getById: async (em: EntityManager, id: string): Promise<Plan> => {
    try {
      const plan = await em.findOne(Plan, { id });
      if (!plan) {
        throw new PlanServiceError(`Plan with id ${id} not found`);
      }
      return plan;
    } catch (error) {
      throw new PlanServiceError(
        `Failed to fetch plan: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  update: async (
    em: EntityManager,
    id: string,
    data: Partial<Plan>
  ): Promise<Plan> => {
    try {
      const plan = await PlanService.getById(em, id);
      em.assign(plan, { ...data, updatedAt: new Date() });
      await em.flush();
      return plan;
    } catch (error) {
      throw new PlanServiceError(
        `Failed to update plan: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  delete: async (em: EntityManager, id: string): Promise<void> => {
    try {
      const plan = await PlanService.getById(em, id);
      await em.removeAndFlush(plan);
    } catch (error) {
      throw new PlanServiceError(
        `Failed to delete plan: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
};
