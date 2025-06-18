import { EntityManager } from "@mikro-orm/core";
import { User } from "../../entities/tenant/User";

export class UserServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserServiceError";
  }
}

interface CreateUserData {
  email: string;
}

export const UserService = {
  getAll: async (em: EntityManager): Promise<User[]> => {
    try {
      return await em.find(User, { deletedAt: null });
    } catch (error) {
      throw new UserServiceError(
        `Failed to fetch users: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  create: async (em: EntityManager, data: CreateUserData): Promise<User> => {
    try {
      const user = em.create(User, {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await em.persistAndFlush(user);
      return user;
    } catch (error) {
      if (error instanceof Error && error.message.includes("duplicate key")) {
        throw new UserServiceError("A user with this email already exists");
      }
      throw new UserServiceError(
        `Failed to create user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  getById: async (em: EntityManager, id: string): Promise<User> => {
    try {
      const user = await em.findOne(User, { id });
      if (!user) {
        throw new UserServiceError(`User with id ${id} not found`);
      }
      return user;
    } catch (error) {
      throw new UserServiceError(
        `Failed to fetch user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  update: async (
    em: EntityManager,
    id: string,
    data: Partial<User>
  ): Promise<User> => {
    try {
      const user = await UserService.getById(em, id);
      em.assign(user, { ...data, updatedAt: new Date() });
      await em.flush();
      return user;
    } catch (error) {
      throw new UserServiceError(
        `Failed to update user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  softDelete: async (em: EntityManager, id: string): Promise<User> => {
    return UserService.update(em, id, { deletedAt: new Date() });
  },

  restore: async (em: EntityManager, id: string): Promise<User> => {
    try {
      const user = await em.findOne(User, { id });
      if (!user) {
        throw new UserServiceError(`User with id ${id} not found`);
      }
      if (!user.deletedAt) {
        throw new UserServiceError(`User with id ${id} is not deleted`);
      }
      return UserService.update(em, id, { deletedAt: null });
    } catch (error) {
      throw new UserServiceError(
        `Failed to restore user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  permanentDelete: async (em: EntityManager, id: string): Promise<void> => {
    try {
      const user = await em.findOne(User, { id });
      if (!user) {
        throw new UserServiceError(`User with id ${id} not found`);
      }
      await em.removeAndFlush(user);
    } catch (error) {
      throw new UserServiceError(
        `Failed to permanently delete user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
};
