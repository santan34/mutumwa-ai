import { EntityManager } from "@mikro-orm/core";
import { Feature } from "../entities/public/Feature";

export class FeatureServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FeatureServiceError";
  }
}

interface CreateFeatureData {
  name: string;
  endpointPath: string;
  description?: string;
}

export const FeatureService = {
  getAll: async (em: EntityManager): Promise<Feature[]> => {
    try {
      return await em.find(Feature, { deletedAt: null });
    } catch (error) {
      throw new FeatureServiceError(
        `Failed to fetch features: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  create: async (
    em: EntityManager,
    data: CreateFeatureData
  ): Promise<Feature> => {
    try {
      const feature = em.create(Feature, {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await em.persistAndFlush(feature);
      return feature;
    } catch (error) {
      if (error instanceof Error && error.message.includes("duplicate key")) {
        throw new FeatureServiceError(
          "A feature with this name already exists"
        );
      }
      throw new FeatureServiceError(
        `Failed to create feature: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  getById: async (em: EntityManager, id: string): Promise<Feature> => {
    try {
      const feature = await em.findOne(Feature, { id, deletedAt: null });
      if (!feature) {
        throw new FeatureServiceError(`Feature with id ${id} not found`);
      }
      return feature;
    } catch (error) {
      throw new FeatureServiceError(
        `Failed to fetch feature: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  update: async (
    em: EntityManager,
    id: string,
    data: Partial<Feature>
  ): Promise<Feature> => {
    try {
      const feature = await FeatureService.getById(em, id);
      em.assign(feature, { ...data, updatedAt: new Date() });
      await em.flush();
      return feature;
    } catch (error) {
      throw new FeatureServiceError(
        `Failed to update feature: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  softDelete: async (em: EntityManager, id: string): Promise<void> => {
    try {
      const feature = await FeatureService.getById(em, id);
      feature.deletedAt = new Date();
      await em.flush();
    } catch (error) {
      throw new FeatureServiceError(
        `Failed to delete feature: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
};
