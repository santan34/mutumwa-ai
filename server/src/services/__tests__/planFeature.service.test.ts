import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { PlanFeatureService, PlanFeatureServiceError } from "../public/planFeatures.service";
import { PlanFeature } from "../../entities/public/PlanFeature";
import { RatePeriod } from "../../entities/public/RatePeriod";
import { IPlanFeature } from "../../interfaces/public/planFeature.interface";

const mockFind = jest.fn().mockImplementation(() => Promise.resolve([]));
const mockFindOne = jest.fn().mockImplementation(() => Promise.resolve(null));
const mockCreate = jest.fn();
const mockPersistAndFlush = jest.fn().mockImplementation(() => Promise.resolve());
const mockFlush = jest.fn().mockImplementation(() => Promise.resolve());
const mockAssign = jest.fn();
const mockRemoveAndFlush = jest.fn().mockImplementation(() => Promise.resolve());

const mockEntityManager = {
  find: mockFind,
  findOne: mockFindOne,
  create: mockCreate,
  persistAndFlush: mockPersistAndFlush,
  flush: mockFlush,
  assign: mockAssign,
  removeAndFlush: mockRemoveAndFlush,
} as unknown as EntityManager<IDatabaseDriver<Connection>>;

describe("PlanFeatureService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return all plan features with populated relations", async () => {
      const mockPlanFeatures = [
        {
          planId: "1",
          featureId: "1",
          rateLimit: 100,
          period: RatePeriod.DAY,  // Changed from DAILY to DAY
          createdAt: new Date(),
          plan: { id: "1", name: "Basic Plan" },
          feature: { id: "1", name: "API Access" }
        }
      ];
      mockFind.mockResolvedValue(mockPlanFeatures);

      const result = await PlanFeatureService.getAll(mockEntityManager);

      expect(result).toEqual(mockPlanFeatures);
      expect(mockFind).toHaveBeenCalledWith(
        PlanFeature, 
        {}, 
        { populate: ["plan", "feature"] }
      );
    });

    it("should handle database errors", async () => {
      mockFind.mockRejectedValue(new Error("DB error"));

      await expect(PlanFeatureService.getAll(mockEntityManager))
        .rejects
        .toThrow(PlanFeatureServiceError);
    });
  });

  describe("create", () => {
    const validData = {
      planId: "1",
      featureId: "1",
      rateLimit: 100,
      period: RatePeriod.DAY  // Changed from DAILY to DAY
    };

    it("should create plan feature with valid data", async () => {
      const mockPlan = { id: "1", name: "Basic Plan" };
      const mockFeature = { id: "1", name: "API Access" };
      mockFindOne
        .mockResolvedValueOnce(mockPlan)
        .mockResolvedValueOnce(mockFeature);

      const mockPlanFeature = {
        plan: mockPlan,
        feature: mockFeature,
        ...validData,
        createdAt: expect.any(Date)
      };
      mockCreate.mockReturnValue(mockPlanFeature);

      const result = await PlanFeatureService.create(mockEntityManager, validData);

      expect(result).toEqual(mockPlanFeature);
      expect(mockCreate).toHaveBeenCalledWith(PlanFeature, expect.objectContaining({
        plan: mockPlan,
        feature: mockFeature,
        rateLimit: validData.rateLimit,
        period: validData.period,
        createdAt: expect.any(Date)
      }));
    });

    it("should throw error when plan not found", async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(PlanFeatureService.create(mockEntityManager, validData))
        .rejects
        .toThrow("Plan or Feature not found");
    });

    it("should create without optional rate limiting", async () => {
      const mockPlan = { id: "1", name: "Basic Plan" };
      const mockFeature = { id: "1", name: "API Access" };
      mockFindOne
        .mockResolvedValueOnce(mockPlan)
        .mockResolvedValueOnce(mockFeature);

      const minimalData = {
        planId: "1",
        featureId: "1"
      };

      await PlanFeatureService.create(mockEntityManager, minimalData);

      expect(mockCreate).toHaveBeenCalledWith(
        PlanFeature,
        expect.not.objectContaining({
          rateLimit: expect.any(Number),
          period: expect.any(String)
        })
      );
    });
  });

  describe("getByIds", () => {
    it("should return plan feature by plan and feature IDs", async () => {
      const mockPlanFeature = {
        planId: "1",
        featureId: "1",
        rateLimit: 100,
        period: RatePeriod.DAY,  // Changed from DAILY to DAY
        plan: { id: "1", name: "Basic Plan" },
        feature: { id: "1", name: "API Access" }
      };
      mockFindOne.mockResolvedValue(mockPlanFeature);

      const result = await PlanFeatureService.getByIds(mockEntityManager, "1", "1");

      expect(result).toEqual(mockPlanFeature);
      expect(mockFindOne).toHaveBeenCalledWith(
        PlanFeature,
        { plan: "1", feature: "1" },
        { populate: ["plan", "feature"] }
      );
    });

    it("should throw error when plan feature not found", async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(PlanFeatureService.getByIds(mockEntityManager, "999", "999"))
        .rejects
        .toThrow("Plan feature not found");
    });
  });

  describe("update", () => {
    const updateData = {
      rateLimit: 200,
      period: RatePeriod.MONTH  // Changed from MONTHLY to MONTH
    };

    it("should update plan feature with valid data", async () => {
      const existingPlanFeature = {
        planId: "1",
        featureId: "1",
        rateLimit: 100,
        period: RatePeriod.DAY  // Changed from DAILY to DAY
      };
      mockFindOne.mockResolvedValue(existingPlanFeature);

      await PlanFeatureService.update(mockEntityManager, "1", "1", updateData);

      expect(mockAssign).toHaveBeenCalledWith(
        existingPlanFeature,
        updateData
      );
      expect(mockFlush).toHaveBeenCalled();
    });

    it("should throw error when updating non-existent plan feature", async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(PlanFeatureService.update(mockEntityManager, "999", "999", updateData))
        .rejects
        .toThrow("Plan feature not found");
    });
  });

  describe("delete", () => {
    it("should delete existing plan feature", async () => {
      const planFeature = {
        planId: "1",
        featureId: "1"
      };
      mockFindOne.mockResolvedValue(planFeature);

      await PlanFeatureService.delete(mockEntityManager, "1", "1");

      expect(mockRemoveAndFlush).toHaveBeenCalledWith(planFeature);
    });

    it("should throw error when deleting non-existent plan feature", async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(PlanFeatureService.delete(mockEntityManager, "999", "999"))
        .rejects
        .toThrow("Plan feature not found");
    });

    it("should handle database errors during deletion", async () => {
      const planFeature = { planId: "1", featureId: "1" };
      mockFindOne.mockResolvedValue(planFeature);
      mockRemoveAndFlush.mockRejectedValue(new Error("DB error"));

      await expect(PlanFeatureService.delete(mockEntityManager, "1", "1"))
        .rejects
        .toThrow(PlanFeatureServiceError);
    });
  });
});