import { EntityManager } from "@mikro-orm/core";
import { SystemAdmin } from "../entities/public/SystemAdmin";

export class SystemAdminServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SystemAdminServiceError";
  }
}

interface CreateSystemAdminData {
  email: string;
  name: string;
}

export const SystemAdminService = {
  getAll: async (em: EntityManager): Promise<SystemAdmin[]> => {
    try {
      return await em.find(SystemAdmin, {});
    } catch (error) {
      throw new SystemAdminServiceError(
        `Failed to fetch system admins: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  create: async (
    em: EntityManager,
    data: CreateSystemAdminData
  ): Promise<SystemAdmin> => {
    try {
      const admin = em.create(SystemAdmin, {
        ...data,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await em.persistAndFlush(admin);
      return admin;
    } catch (error) {
      if (error instanceof Error && error.message.includes("duplicate key")) {
        throw new SystemAdminServiceError(
          "A system admin with this email already exists"
        );
      }
      throw new SystemAdminServiceError(
        `Failed to create system admin: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  getById: async (em: EntityManager, id: string): Promise<SystemAdmin> => {
    try {
      const admin = await em.findOne(SystemAdmin, { id });
      if (!admin) {
        throw new SystemAdminServiceError(
          `System admin with id ${id} not found`
        );
      }
      return admin;
    } catch (error) {
      throw new SystemAdminServiceError(
        `Failed to fetch system admin: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  update: async (
    em: EntityManager,
    id: string,
    data: Partial<SystemAdmin>
  ): Promise<SystemAdmin> => {
    try {
      const admin = await SystemAdminService.getById(em, id);
      em.assign(admin, { ...data, updatedAt: new Date() });
      await em.flush();
      return admin;
    } catch (error) {
      throw new SystemAdminServiceError(
        `Failed to update system admin: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  toggleActive: async (em: EntityManager, id: string): Promise<SystemAdmin> => {
    const admin = await SystemAdminService.getById(em, id);
    return SystemAdminService.update(em, id, { isActive: !admin.isActive });
  },
};
