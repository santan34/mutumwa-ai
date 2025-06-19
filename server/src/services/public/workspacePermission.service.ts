import { EntityManager } from "@mikro-orm/core";
import { WorkspacePermission } from "../../entities/public/WorkspacePermission";

export class WorkspacePermissionServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkspacePermissionServiceError";
  }
}

interface CreateWorkspacePermissionData {
  name: string;
  description?: string;
}

export const WorkspacePermissionService = {
  getAll: async (em: EntityManager): Promise<WorkspacePermission[]> => {
    try {
      return await em.find(WorkspacePermission, { deletedAt: null });
    } catch (error) {
      throw new WorkspacePermissionServiceError(
        `Failed to fetch permissions: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  create: async (
    em: EntityManager,
    data: CreateWorkspacePermissionData
  ): Promise<WorkspacePermission> => {
    try {
      const permission = em.create(WorkspacePermission, {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await em.persistAndFlush(permission);
      return permission;
    } catch (error) {
      throw new WorkspacePermissionServiceError(
        `Failed to create permission: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  getById: async (
    em: EntityManager,
    id: string
  ): Promise<WorkspacePermission> => {
    try {
      const permission = await em.findOne(WorkspacePermission, {
        id,
        deletedAt: null,
      });
      if (!permission) {
        throw new WorkspacePermissionServiceError("Permission not found");
      }
      return permission;
    } catch (error) {
      throw new WorkspacePermissionServiceError(
        `Failed to fetch permission: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  update: async (
    em: EntityManager,
    id: string,
    data: Partial<WorkspacePermission>
  ): Promise<WorkspacePermission> => {
    try {
      const permission = await WorkspacePermissionService.getById(em, id);
      em.assign(permission, { ...data, updatedAt: new Date() });
      await em.flush();
      return permission;
    } catch (error) {
      throw new WorkspacePermissionServiceError(
        `Failed to update permission: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  softDelete: async (em: EntityManager, id: string): Promise<void> => {
    try {
      const permission = await WorkspacePermissionService.getById(em, id);
      permission.deletedAt = new Date();
      await em.flush();
    } catch (error) {
      throw new WorkspacePermissionServiceError(
        `Failed to delete permission: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
};
