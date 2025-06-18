import { EntityManager } from "@mikro-orm/core";
import { User } from "../entities/tenant/User";
import { createTenantSchema } from '../utils/createTenantSchema';

export class TenantServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TenantServiceError";
  }
}

interface CreateTenantData {
  email: string;
  org_id: string; // Add org_id to the data interface
}

export const TenantService = {
  getAll: async (em: EntityManager): Promise<User[]> => {
    try {
      return await em.find(User, { deletedAt: null });
    } catch (error) {
      throw new TenantServiceError(
        `Failed to fetch tenants: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  create: async (em: EntityManager, data: CreateTenantData): Promise<User> => {
    try {
      const user = em.create(User, {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await em.persistAndFlush(user);
      await createTenantSchema(data.org_id); // Use org_id from organisation table
      return user;
    } catch (error) {
      throw new TenantServiceError(
        `Failed to create tenant: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  getById: async (em: EntityManager, id: string): Promise<User> => {
    try {
      const user = await em.findOne(User, { id });
      if (!user) throw new TenantServiceError(`Tenant with id ${id} not found`);
      return user;
    } catch (error) {
      throw new TenantServiceError(
        `Failed to fetch tenant: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  update: async (em: EntityManager, id: string, data: Partial<User>): Promise<User> => {
    try {
      const user = await TenantService.getById(em, id);
      em.assign(user, { ...data, updatedAt: new Date() });
      await em.flush();
      return user;
    } catch (error) {
      throw new TenantServiceError(
        `Failed to update tenant: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  softDelete: async (em: EntityManager, id: string): Promise<User> => {
    return TenantService.update(em, id, { deletedAt: new Date() });
  },

  activate: async (em: EntityManager, id: string): Promise<User> => {
    return TenantService.update(em, id, { deletedAt: undefined });
  },

  getSoftDeleted: async (em: EntityManager): Promise<User[]> => {
    try {
      return await em.find(User, { deletedAt: { $ne: null } });
    } catch (error) {
      throw new TenantServiceError(
        `Failed to fetch deleted tenants: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },
};
