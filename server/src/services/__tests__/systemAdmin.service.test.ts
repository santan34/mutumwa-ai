import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { SystemAdminService } from "../public/systemAdmin.service";
import { SystemAdmin } from "../../entities/public/SystemAdmin";
import { ISystemAdmin } from "../../interfaces/public/systemAdmin.interface";

const mockFind = jest.fn().mockImplementation(() => Promise.resolve([]));
const mockFindOne = jest.fn().mockImplementation(() => Promise.resolve(null));
const mockCreate = jest.fn();
const mockPersistAndFlush = jest.fn().mockImplementation(() => Promise.resolve());
const mockFlush = jest.fn().mockImplementation(() => Promise.resolve());
const mockAssign = jest.fn();

const mockEntityManager = {
  find: mockFind,
  findOne: mockFindOne,
  create: mockCreate,
  persistAndFlush: mockPersistAndFlush,
  flush: mockFlush,
  assign: mockAssign,
} as unknown as EntityManager<IDatabaseDriver<Connection>>;

describe("SystemAdminService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return all active system admins", async () => {
      const mockAdmins: ISystemAdmin[] = [
        { 
          id: "1", 
          email: "admin1@test.com",
          name: "Admin One",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "2",
          email: "admin2@test.com",
          name: "Admin Two",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      mockFind.mockResolvedValue(mockAdmins);

      const result = await SystemAdminService.getAll(mockEntityManager);

      expect(result).toEqual(mockAdmins);
      expect(mockFind).toHaveBeenCalledWith(SystemAdmin, { isActive: true });
    });

    it("should handle database errors", async () => {
      mockFind.mockRejectedValue(new Error("DB error"));

      await expect(SystemAdminService.getAll(mockEntityManager))
        .rejects
        .toThrow("Failed to fetch system admins");
    });
  });

  describe("create", () => {
    const validAdminData = {
      email: "newadmin@test.com",
      name: "New Admin"
    };

    it("should create system admin with valid data", async () => {
      const mockAdmin = {
        id: "1",
        ...validAdminData,
        isActive: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      };
      mockCreate.mockReturnValue(mockAdmin);

      const result = await SystemAdminService.create(mockEntityManager, validAdminData);

      expect(result).toEqual(mockAdmin);
      expect(mockCreate).toHaveBeenCalledWith(SystemAdmin, expect.objectContaining({
        ...validAdminData,
        isActive: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      }));
    });

    it("should reject duplicate email addresses", async () => {
      mockCreate.mockImplementation(() => {
        throw new Error("duplicate key value violates unique constraint");
      });

      await expect(SystemAdminService.create(mockEntityManager, validAdminData))
        .rejects
        .toThrow("An admin with this email already exists");
    });

    it("should validate email format", async () => {
      const invalidData = {
        ...validAdminData,
        email: "invalid-email"
      };

      await expect(SystemAdminService.create(mockEntityManager, invalidData))
        .rejects
        .toThrow("Invalid email format");
    });
  });

  describe("getById", () => {
    it("should return active system admin by valid ID", async () => {
      const mockAdmin: ISystemAdmin = {
        id: "1",
        email: "admin@test.com",
        name: "Test Admin",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockFindOne.mockResolvedValue(mockAdmin);

      const result = await SystemAdminService.getById(mockEntityManager, "1");

      expect(result).toEqual(mockAdmin);
      expect(mockFindOne).toHaveBeenCalledWith(SystemAdmin, { id: "1", isActive: true });
    });

    it("should throw error for non-existent admin", async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(SystemAdminService.getById(mockEntityManager, "999"))
        .rejects
        .toThrow("System admin with id 999 not found");
    });
  });

  describe("update", () => {
    const updateData = {
      name: "Updated Name",
      email: "updated@test.com"
    };

    it("should update admin with valid data", async () => {
      const existingAdmin = {
        id: "1",
        email: "old@test.com",
        name: "Old Name",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockFindOne.mockResolvedValue(existingAdmin);

      await SystemAdminService.update(mockEntityManager, "1", updateData);

      expect(mockAssign).toHaveBeenCalledWith(
        existingAdmin,
        expect.objectContaining({
          ...updateData,
          updatedAt: expect.any(Date)
        })
      );
    });

    it("should prevent updating non-existent admin", async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(SystemAdminService.update(mockEntityManager, "999", updateData))
        .rejects
        .toThrow("System admin with id 999 not found");
    });

    it("should validate email format on update", async () => {
      const invalidUpdate = {
        email: "invalid-email"
      };
      mockFindOne.mockResolvedValue({ id: "1" });

      await expect(SystemAdminService.update(mockEntityManager, "1", invalidUpdate))
        .rejects
        .toThrow("Invalid email format");
    });
  });

  describe("toggleActive", () => {
    it("should deactivate an active admin", async () => {
      const admin = { 
        id: "1", 
        isActive: true,
        email: "admin@test.com",
        name: "Test Admin"
      };
      mockFindOne.mockResolvedValue(admin);

      await SystemAdminService.toggleActive(mockEntityManager, "1");

      expect(mockAssign).toHaveBeenCalledWith(
        admin,
        expect.objectContaining({
          isActive: false,
          updatedAt: expect.any(Date)
        })
      );
    });

    it("should activate an inactive admin", async () => {
      const admin = { 
        id: "1", 
        isActive: false,
        email: "admin@test.com",
        name: "Test Admin"
      };
      mockFindOne.mockResolvedValue(admin);

      await SystemAdminService.toggleActive(mockEntityManager, "1");

      expect(mockAssign).toHaveBeenCalledWith(
        admin,
        expect.objectContaining({
          isActive: true,
          updatedAt: expect.any(Date)
        })
      );
    });

    it("should throw error when toggling non-existent admin", async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(SystemAdminService.toggleActive(mockEntityManager, "999"))
        .rejects
        .toThrow("System admin with id 999 not found");
    });

    it("should handle database errors during toggle", async () => {
      const admin = { id: "1", isActive: true };
      mockFindOne.mockResolvedValue(admin);
      mockAssign.mockImplementation(() => {
        throw new Error("DB error");
      });

      await expect(SystemAdminService.toggleActive(mockEntityManager, "1"))
        .rejects
        .toThrow("Failed to update system admin");
    });
  });
});