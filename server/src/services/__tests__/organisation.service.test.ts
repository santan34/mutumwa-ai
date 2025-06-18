import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Organisation } from "../../entities/public/Organisation";
import { OrganisationService } from "../organisation.service";


const mockFind = jest.fn().mockImplementation(() => Promise.resolve([])) as jest.Mock;
const mockFindOne = jest.fn().mockImplementation(() => Promise.resolve(null)) as jest.Mock;
const mockCreate = jest.fn() as jest.Mock;
const mockPersistAndFlush = jest.fn().mockImplementation(() => Promise.resolve()) as jest.Mock;
const mockFlush = jest.fn().mockImplementation(() => Promise.resolve()) as jest.Mock;
const mockAssign = jest.fn() as jest.Mock;

// Create the mockEntityManager with properly typed mock functions
const mockEntityManager = {
  find: mockFind,
  findOne: mockFindOne,
  create: mockCreate,
  persistAndFlush: mockPersistAndFlush,
  flush: mockFlush,
  assign: mockAssign,
} as unknown as EntityManager<IDatabaseDriver<Connection>>;

// Mock createTenantSchema utility
jest.mock("../../utils/createTenantSchema", () => ({
  createTenantSchema: jest.fn(),
}));

describe("OrganisationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return all active organizations", async () => {
      const mockActiveOrgs = [
        { id: "1", name: "Org 1", deletedAt: null },
        { id: "2", name: "Org 2", deletedAt: null }
      ];
      mockFind.mockResolvedValue(mockActiveOrgs);

      const result = await OrganisationService.getAll(mockEntityManager);

      expect(result).toEqual(mockActiveOrgs);
      expect(result.length).toBe(2);
      expect(mockFind).toHaveBeenCalledWith(Organisation, { deletedAt: null });
    });

    it("should exclude soft-deleted organizations", async () => {
      const mockOrgs = [
        { id: "1", name: "Active Org", deletedAt: null },
        { id: "2", name: "Deleted Org", deletedAt: new Date() }
      ];
      mockFind.mockResolvedValue([mockOrgs[0]]); // Only return active org

      const result = await OrganisationService.getAll(mockEntityManager);

      expect(result).toHaveLength(1);
      expect(result[0].deletedAt).toBeNull();
      expect(result.some(org => org.deletedAt !== null)).toBeFalsy();
    });

    it("should handle empty database", async () => {
      mockFind.mockResolvedValue([]);

      const result = await OrganisationService.getAll(mockEntityManager);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(mockFind).toHaveBeenCalled();
    });

    it("should throw error when database query fails", async () => {
      mockFind.mockRejectedValue(new Error("DB error"));

      await expect(OrganisationService.getAll(mockEntityManager))
        .rejects
        .toThrow("Failed to fetch organisations");
    });
  });

  describe("create", () => {
    const createData = {
      name: "New Org",
      domain: "neworg.com", 
      sector: "Technology"
    };

    it("should create a new organisation", async () => {
      const mockOrg = { id: "1", ...createData };
      mockCreate.mockReturnValue(mockOrg);

      const result = await OrganisationService.create(mockEntityManager, createData);

      expect(result).toEqual(mockOrg);
      expect(mockCreate).toHaveBeenCalledWith(Organisation, expect.objectContaining({
        ...createData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }));
      expect(mockPersistAndFlush).toHaveBeenCalled();
    });

    it("should throw error when organisation with domain already exists", async () => {
      mockCreate.mockImplementation(() => {
        throw new Error("duplicate key");
      });

      await expect(OrganisationService.create(mockEntityManager, createData))
        .rejects
        .toThrow("An organisation with this domain already exists");
    });

    // it show throw an error when rganisation with the same id exists
  });

  describe("getById", () => {
    it("should return organisation by id", async () => {
      const mockOrg = { id: "1", name: "Test Org" };
      mockFindOne.mockResolvedValue(mockOrg);
      const result = await OrganisationService.getById(mockEntityManager, "1");
      expect(result).toEqual(mockOrg);
      expect(mockFindOne).toHaveBeenCalledWith(Organisation, { id: "1" });
    });

    it("should throw error when organisation not found", async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(OrganisationService.getById(mockEntityManager, "1"))
        .rejects
        .toThrow("Organisation with id 1 not found");
    });
  });

  describe("update", () => {
    it("should update organisation", async () => {
      const mockOrg = { id: "1", name: "Old Name" };
      const updateData = { name: "New Name" };
      mockFindOne.mockResolvedValue(mockOrg);
      mockAssign.mockImplementation((org, data) => ({ ...org, ...data, updatedAt: new Date() }));

      const result = await OrganisationService.update(mockEntityManager, "1", updateData);

      expect(result).toEqual(expect.objectContaining({
        id: "1",
        name: "New Name",
      }));
      expect(mockFlush).toHaveBeenCalled();
      expect(mockAssign).toHaveBeenCalledWith(mockOrg, expect.objectContaining(updateData));
    });
  });

  describe("softDelete", () => {
    it("should soft delete organisation", async () => {
      const mockOrg = { id: "1", name: "Test Org" };
      mockFindOne.mockResolvedValue(mockOrg);

      await OrganisationService.softDelete(mockEntityManager, "1");

      expect(mockAssign).toHaveBeenCalledWith(
        mockOrg,
        expect.objectContaining({
          deletedAt: expect.any(Date),
        })
      );
    });
  });
});