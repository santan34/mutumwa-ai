import { EntityManager } from "@mikro-orm/core";
import { ApiUsage } from "../../entities/public/ApiUsage";
import { Organisation } from "../../entities/public/Organisation";
import { Feature } from "../../entities/public/Feature";

export class ApiUsageServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiUsageServiceError";
  }
}

interface CreateApiUsageData {
  organisationId: string;
  featureId: string;
  periodStart: Date;
  usageCount: number;
}

export const ApiUsageService = {
  getAll: async (em: EntityManager): Promise<ApiUsage[]> => {
    try {
      return await em.find(ApiUsage, {}, { populate: ["organisation", "feature"] });
    } catch (error) {
      throw new ApiUsageServiceError(
        `Failed to fetch API usage records: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  create: async (
    em: EntityManager,
    data: CreateApiUsageData
  ): Promise<ApiUsage> => {
    try {
      const organisation = await em.findOne(Organisation, { id: data.organisationId });
      const feature = await em.findOne(Feature, { id: data.featureId });

      if (!organisation || !feature) {
        throw new ApiUsageServiceError("Organisation or Feature not found");
      }

      const apiUsage = em.create(ApiUsage, {
        organisation,
        feature,
        periodStart: data.periodStart,
        usageCount: data.usageCount,
        createdAt: new Date()
      });

      await em.persistAndFlush(apiUsage);
      return apiUsage;
    } catch (error) {
      throw new ApiUsageServiceError(
        `Failed to create API usage record: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  getByKeys: async (
    em: EntityManager,
    organisationId: string,
    featureId: string,
    periodStart: Date
  ): Promise<ApiUsage> => {
    try {
      const apiUsage = await em.findOne(ApiUsage, {
        organisation: organisationId,
        feature: featureId,
        periodStart
      }, { populate: ["organisation", "feature"] });

      if (!apiUsage) {
        throw new ApiUsageServiceError("API usage record not found");
      }

      return apiUsage;
    } catch (error) {
      throw new ApiUsageServiceError(
        `Failed to fetch API usage record: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  update: async (
    em: EntityManager,
    organisationId: string,
    featureId: string,
    periodStart: Date,
    data: Partial<ApiUsage>
  ): Promise<ApiUsage> => {
    try {
      const apiUsage = await ApiUsageService.getByKeys(em, organisationId, featureId, periodStart);
      em.assign(apiUsage, data);
      await em.flush();
      return apiUsage;
    } catch (error) {
      throw new ApiUsageServiceError(
        `Failed to update API usage record: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  incrementUsage: async (
    em: EntityManager,
    organisationId: string,
    featureId: string,
    periodStart: Date
  ): Promise<ApiUsage> => {
    try {
      const apiUsage = await ApiUsageService.getByKeys(em, organisationId, featureId, periodStart);
      apiUsage.usageCount += 1;
      await em.flush();
      return apiUsage;
    } catch (error) {
      throw new ApiUsageServiceError(
        `Failed to increment usage count: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
};