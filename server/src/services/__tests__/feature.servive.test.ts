import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Feature } from "../../entities/public/Feature";
import { IFeature } from "../../interfaces/public/feature.interface";
import { FeatureService } from "../public/feature.service";

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

describe("FeatureService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return all active features", async () => {
      const mockFeatures = [
        { id: "1", name: "Feature 1", endpointPath: "/api/1", deletedAt: null },
        { id: "2", name: "Feature 2", endpointPath: "/api/2", deletedAt: null }
      ];
      mockFind.mockResolvedValue(mockFeatures);

      const result = await FeatureService.getAll(mockEntityManager);

      expect(result).toEqual(mockFeatures);
      expect(mockFind).toHaveBeenCalledWith(Feature, { deletedAt: null });
    });

    it("should exclude soft-deleted features", async () => {
      const mockFeatures = [
        { id: "1", name: "Active Feature", deletedAt: null },
        { id: "2", name: "Deleted Feature", deletedAt: new Date() }
      ];
      mockFind.mockResolvedValue([mockFeatures[0]]);

      const result = await FeatureService.getAll(mockEntityManager);

      expect(result).toHaveLength(1);
      expect(result[0].deletedAt).toBeNull();
    });

    it("should handle database errors gracefully", async () => {
      mockFind.mockRejectedValue(new Error("DB error"));

      await expect(FeatureService.getAll(mockEntityManager))
        .rejects
        .toThrow("Failed to fetch features");
    });
  });

  describe("create", () => {
    const createData = {
      name: "New Feature",
      endpointPath: "/api/new",
      description: "Test description"
    };

    it("should create feature with valid data", async () => {
      const mockFeature = { id: "1", ...createData };
      mockCreate.mockReturnValue(mockFeature);

      const result = await FeatureService.create(mockEntityManager, createData);

      expect(result).toEqual(mockFeature);
      expect(mockCreate).toHaveBeenCalledWith(Feature, expect.objectContaining({
        ...createData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      }));
    });

    it("should reject duplicate feature names", async () => {
      mockCreate.mockImplementation(() => {
        throw new Error("duplicate key");
      });

      await expect(FeatureService.create(mockEntityManager, createData))
        .rejects
        .toThrow("A feature with this name already exists");
    });

    it("should create feature without optional description", async () => {
      const minimalData = {
        name: "Mini Feature",
        endpointPath: "/api/minimal"
      };
      
      await FeatureService.create(mockEntityManager, minimalData);

      expect(mockCreate).toHaveBeenCalledWith(Feature, expect.objectContaining(minimalData));
    });

    it("should validate endpoint path format", async () => {
      const invalidData = {
        ...createData,
        endpointPath: "invalid-path"
      };

      await expect(FeatureService.create(mockEntityManager, invalidData))
        .rejects
        .toThrow("Invalid endpoint path format");
    });
  });

  describe("getById", () => {
    it("should return feature by valid ID", async () => {
      const mockFeature = { 
        id: "1", 
        name: "Test Feature",
        endpointPath: "/api/test" 
      };
      mockFindOne.mockResolvedValue(mockFeature);

      const result = await FeatureService.getById(mockEntityManager, "1");

      expect(result).toEqual(mockFeature);
      expect(mockFindOne).toHaveBeenCalledWith(Feature, { id: "1", deletedAt: null });
    });

    it("should throw error for non-existent feature", async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(FeatureService.getById(mockEntityManager, "999"))
        .rejects
        .toThrow("Feature with id 999 not found");
    });

    it("should not return soft-deleted features", async () => {
      mockFindOne.mockResolvedValue({ id: "1", deletedAt: new Date() });

      await expect(FeatureService.getById(mockEntityManager, "1"))
        .rejects
        .toThrow("Feature with id 1 not found");
    });
  });

  describe("update", () => {
    const updateData = {
      name: "Updated Feature",
      description: "Updated description"
    };

    it("should update feature with valid data", async () => {
      const existingFeature = { 
        id: "1", 
        name: "Old Name",
        endpointPath: "/api/old"
      };
      mockFindOne.mockResolvedValue(existingFeature);

      await FeatureService.update(mockEntityManager, "1", updateData);

      expect(mockAssign).toHaveBeenCalledWith(
        existingFeature,
        expect.objectContaining({
          ...updateData,
          updatedAt: expect.any(Date)
        })
      );
    });

    it("should prevent updating non-existent feature", async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(FeatureService.update(mockEntityManager, "999", updateData))
        .rejects
        .toThrow("Feature with id 999 not found");
    });

    it("should validate endpoint path on update", async () => {
      const invalidUpdate = {
        endpointPath: "invalid-path"
      };
      mockFindOne.mockResolvedValue({ id: "1" });

      await expect(FeatureService.update(mockEntityManager, "1", invalidUpdate))
        .rejects
        .toThrow("Invalid endpoint path format");
    });
  });

  describe("softDelete", () => {
    it("should soft delete existing feature", async () => {
      const feature: Partial<IFeature> = { 
        id: "1", 
        name: "Test Feature",
        deletedAt: null
      };
      mockFindOne.mockResolvedValue(feature);

      await FeatureService.softDelete(mockEntityManager, "1");

      expect(mockFlush).toHaveBeenCalled();
      expect(feature.deletedAt).toBeInstanceOf(Date);
    });

    it("should throw error when deleting non-existent feature", async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(FeatureService.softDelete(mockEntityManager, "999"))
        .rejects
        .toThrow("Feature with id 999 not found");
    });

    it("should handle already deleted features", async () => {
      mockFindOne.mockResolvedValue({ 
        id: "1", 
        deletedAt: new Date() 
      });

      await expect(FeatureService.softDelete(mockEntityManager, "1"))
        .rejects
        .toThrow("Feature with id 1 not found");
    });
  });
});