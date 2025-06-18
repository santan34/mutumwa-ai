import { EntityManager } from "@mikro-orm/core";
import { PlanFeature } from "../../entities/public/PlanFeature";
import { Plan } from "../../entities/public/Plan";
import { Feature } from "../../entities/public/Feature";
import { RatePeriod } from "../../entities/public/RatePeriod";

export class PlanFeatureServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlanFeatureServiceError";
  }
}

interface CreatePlanFeatureData {
  planId: string;
  featureId: string;
  rateLimit?: number;
  period?: RatePeriod;
}

export const PlanFeatureService = {
  getAll: async (em: EntityManager): Promise<PlanFeature[]> => {
    try {
      return await em.find(PlanFeature, {}, { populate: ["plan", "feature"] });
    } catch (error) {
      throw new PlanFeatureServiceError(
        `Failed to fetch plan features: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  create: async (
    em: EntityManager,
    data: CreatePlanFeatureData
  ): Promise<PlanFeature> => {
    try {
      const plan = await em.findOne(Plan, { id: data.planId });
      const feature = await em.findOne(Feature, { id: data.featureId });

      if (!plan || !feature) {
        throw new PlanFeatureServiceError("Plan or Feature not found");
      }

      const planFeature = em.create(PlanFeature, {
        plan,
        feature,
        rateLimit: data.rateLimit,
        period: data.period,
        createdAt: new Date(),
      });

      await em.persistAndFlush(planFeature);
      return planFeature;
    } catch (error) {
      throw new PlanFeatureServiceError(
        `Failed to create plan feature: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  getByIds: async (
    em: EntityManager,
    planId: string,
    featureId: string
  ): Promise<PlanFeature> => {
    try {
      const planFeature = await em.findOne(
        PlanFeature,
        {
          plan: planId,
          feature: featureId,
        },
        { populate: ["plan", "feature"] }
      );

      if (!planFeature) {
        throw new PlanFeatureServiceError(
          `Plan feature not found for plan ${planId} and feature ${featureId}`
        );
      }
      return planFeature;
    } catch (error) {
      throw new PlanFeatureServiceError(
        `Failed to fetch plan feature: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  update: async (
    em: EntityManager,
    planId: string,
    featureId: string,
    data: Partial<PlanFeature>
  ): Promise<PlanFeature> => {
    try {
      const planFeature = await PlanFeatureService.getByIds(
        em,
        planId,
        featureId
      );
      em.assign(planFeature, data);
      await em.flush();
      return planFeature;
    } catch (error) {
      throw new PlanFeatureServiceError(
        `Failed to update plan feature: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  delete: async (
    em: EntityManager,
    planId: string,
    featureId: string
  ): Promise<void> => {
    try {
      const planFeature = await PlanFeatureService.getByIds(
        em,
        planId,
        featureId
      );
      await em.removeAndFlush(planFeature);
    } catch (error) {
      throw new PlanFeatureServiceError(
        `Failed to delete plan feature: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
};
