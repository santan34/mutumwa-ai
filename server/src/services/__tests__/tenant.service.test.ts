import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { TenantService, TenantServiceError } from "../public/tenant.service";
import { User } from "../../entities/tenant/User";
import { createTenantSchema } from "../../utils/createTenantSchema";

// Mock createTenantSchema utility
jest.mock("../../utils/createTenantSchema", () => ({
  createTenantSchema: jest.fn().mockImplementation(() => Promise.resolve()),
}));

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

describe("TenantService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return all active tenants", async () => {
      const mockTenants = [
        { 
          id: "1", 
          email: "tenant1@test.com",
          org_id: "org1",
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "2",
          email: "tenant2@test.com",
          org_id: "org2",
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      mockFind.mockResolvedValue(mockTenants);

      const result = await TenantService.getAll(mockEntityManager);

      expect(result).toEqual(mockTenants);
      expect(mockFind).toHaveBeenCalledWith(User, { deletedAt: null });
    });

    it("should handle database errors", async () => {
      mockFind.mockRejectedValue(new Error("DB error"));

      await expect(TenantService.getAll(mockEntityManager))
        .rejects
        .toThrow(TenantServiceError);
    });
  });

  describe("create", () => {
    const validTenantData = {
      email: "newtenant@test.com",
      org_id: "org123"
    };

    it("should create tenant with valid data", async () => {
      const mockTenant = {
        id: "1",
        ...validTenantData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      };
      mockCreate.mockReturnValue(mockTenant);

      const result = await TenantService.create(mockEntityManager, validTenantData);

      expect(result).toEqual(mockTenant);
      expect(mockCreate).toHaveBeenCalledWith(User, expect.objectContaining({
        ...validTenantData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      }));
      expect(createTenantSchema).toHaveBeenCalledWith(validTenantData.org_id);
    });

    it("should handle schema creation failure", async () => {
      (createTenantSchema as jest.Mock).mockRejectedValue(new Error("Schema creation failed"));
      
      await expect(TenantService.create(mockEntityManager, validTenantData))
        .rejects
        .toThrow(TenantServiceError);
    });

    it("should validate required fields", async () => {
      const invalidData = { email: "test@test.com" }; // Missing org_id

      await expect(TenantService.create(mockEntityManager, invalidData as any))
        .rejects
        .toThrow(TenantServiceError);
    });
  });

  describe("getById", () => {
    it("should return tenant by valid ID", async () => {
      const mockTenant = {
        id: "1",
        email: "tenant@test.com",
        org_id: "org1",
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockFindOne.mockResolvedValue(mockTenant);

      const result = await TenantService.getById(mockEntityManager, "1");

      expect(result).toEqual(mockTenant);
      expect(mockFindOne).toHaveBeenCalledWith(User, { id: "1" });
    });

    it("should throw error for non-existent tenant", async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(TenantService.getById(mockEntityManager, "999"))
        .rejects
        .toThrow("Tenant with id 999 not found");
    });
  });

  describe("update", () => {
    const updateData = {
      email: "updated@test.com"
    };

    it("should update tenant with valid data", async () => {
      const existingTenant = {
        id: "1",
        email: "old@test.com",
        org_id: "org1",
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockFindOne.mockResolvedValue(existingTenant);

      await TenantService.update(mockEntityManager, "1", updateData);

      expect(mockAssign).toHaveBeenCalledWith(
        existingTenant,
        expect.objectContaining({
          ...updateData,
          updatedAt: expect.any(Date)
        })
      );
    });

    it("should prevent updating non-existent tenant", async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(TenantService.update(mockEntityManager, "999", updateData))
        .rejects
        .toThrow("Tenant with id 999 not found");
    });
  });

  describe("softDelete", () => {
    it("should soft delete tenant", async () => {
      const tenant = {
        id: "1",
        email: "tenant@test.com",
        org_id: "org1"
      };
      mockFindOne.mockResolvedValue(tenant);

      await TenantService.softDelete(mockEntityManager, "1");

      expect(mockAssign).toHaveBeenCalledWith(
        tenant,
        expect.objectContaining({
          deletedAt: expect.any(Date),
          updatedAt: expect.any(Date)
        })
      );
    });
  });

  describe("activate", () => {
    it("should activate soft-deleted tenant", async () => {
      const tenant = {
        id: "1",
        email: "tenant@test.com",
        org_id: "org1",
        deletedAt: new Date()
      };
      mockFindOne.mockResolvedValue(tenant);

      await TenantService.activate(mockEntityManager, "1");

      expect(mockAssign).toHaveBeenCalledWith(
        tenant,
        expect.objectContaining({
          deletedAt: undefined,
          updatedAt: expect.any(Date)
        })
      );
    });
  });

  describe("getSoftDeleted", () => {
    it("should return all soft-deleted tenants", async () => {
      const mockTenants = [
        {
          id: "1",
          email: "deleted1@test.com",
          org_id: "org1",
          deletedAt: new Date()
        }
      ];
      mockFind.mockResolvedValue(mockTenants);

      const result = await TenantService.getSoftDeleted(mockEntityManager);

      expect(result).toEqual(mockTenants);
      expect(mockFind).toHaveBeenCalledWith(User, { deletedAt: { $ne: null } });
    });
  });
});