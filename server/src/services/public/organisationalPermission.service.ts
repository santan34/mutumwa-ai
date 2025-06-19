import { EntityManager } from "@mikro-orm/core";
import { OrganisationalPermission } from "../../entities/public/OrganisationalPermission";

export class OrganisationalPermissionServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrganisationalPermissionServiceError";
  }
}

interface CreateOrganisationalPermissionData {
  name: string;
  description?: string;
}

export const OrganisationalPermissionService = {
  getAll: async (em: EntityManager): Promise<OrganisationalPermission[]> => {
    try {
      return await em.find(OrganisationalPermission, { deletedAt: null });
    } catch (error) {
      throw new OrganisationalPermissionServiceError(
        `Failed to fetch permissions: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  create: async (
    em: EntityManager,
    data: CreateOrganisationalPermissionData
  ): Promise<OrganisationalPermission> => {
    try {
      const permission = em.create(OrganisationalPermission, {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await em.persistAndFlush(permission);
      return permission;
    } catch (error) {
      throw new OrganisationalPermissionServiceError(
        `Failed to create permission: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  getById: async (
    em: EntityManager,
    id: string
  ): Promise<OrganisationalPermission> => {
    try {
      const permission = await em.findOne(OrganisationalPermission, {
        id,
        deletedAt: null,
      });
      if (!permission) {
        throw new OrganisationalPermissionServiceError("Permission not found");
      }
      return permission;
    } catch (error) {
      throw new OrganisationalPermissionServiceError(
        `Failed to fetch permission: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  update: async (
    em: EntityManager,
    id: string,
    data: Partial<OrganisationalPermission>
  ): Promise<OrganisationalPermission> => {
    try {
      const permission = await OrganisationalPermissionService.getById(em, id);
      em.assign(permission, { ...data, updatedAt: new Date() });
      await em.flush();
      return permission;
    } catch (error) {
      throw new OrganisationalPermissionServiceError(
        `Failed to update permission: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  softDelete: async (em: EntityManager, id: string): Promise<void> => {
    try {
      const permission = await OrganisationalPermissionService.getById(em, id);
      permission.deletedAt = new Date();
      await em.flush();
    } catch (error) {
      throw new OrganisationalPermissionServiceError(
        `Failed to delete permission: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
};
