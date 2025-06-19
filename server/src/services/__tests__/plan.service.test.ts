import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { PlanService, PlanServiceError } from "../public/plan.service";
import { Plan } from "../../entities/public/Plan";
import { IPlan } from "../../interfaces/public/plan.interface";

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

describe("PlanService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return all plans", async () => {
      const mockPlans: IPlan[] = [
        { id: "1", name: "Basic", description: "Basic Plan", createdAt: new Date(), updatedAt: new Date() },
        { id: "2", name: "Premium", description: "Premium Plan", createdAt: new Date(), updatedAt: new Date() }
      ];
      mockFind.mockResolvedValue(mockPlans);

      const result = await PlanService.getAll(mockEntityManager);

      expect(result).toEqual(mockPlans);
      expect(mockFind).toHaveBeenCalledWith(Plan, {});
    });

    it("should handle database errors", async () => {
      mockFind.mockRejectedValue(new Error("DB error"));

      await expect(PlanService.getAll(mockEntityManager))
        .rejects
        .toThrow(PlanServiceError);
    });
  });

  describe("create", () => {
    const validPlanData = {
      name: "Test Plan",
      description: "Test Description"
    };

    it("should create plan with valid data", async () => {
      const mockPlan = {
        id: "1",
        ...validPlanData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      };
      mockCreate.mockReturnValue(mockPlan);

      const result = await PlanService.create(mockEntityManager, validPlanData);

      expect(result).toEqual(mockPlan);
      expect(mockCreate).toHaveBeenCalledWith(Plan, expect.objectContaining({
        ...validPlanData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      }));
    });

    it("should reject duplicate plan names", async () => {
      mockCreate.mockImplementation(() => {
        throw new Error("duplicate key");
      });

      await expect(PlanService.create(mockEntityManager, validPlanData))
        .rejects
        .toThrow("A plan with this name already exists");
    });

    it("should validate required fields", async () => {
      const invalidData = { name: "" };

      await expect(PlanService.create(mockEntityManager, invalidData as any))
        .rejects
        .toThrow(PlanServiceError);
    });
  });

  describe("getById", () => {
    it("should return plan by valid ID", async () => {
      const mockPlan: IPlan = {
        id: "1",
        name: "Test Plan",
        description: "Test Description",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockFindOne.mockResolvedValue(mockPlan);

      const result = await PlanService.getById(mockEntityManager, "1");

      expect(result).toEqual(mockPlan);
      expect(mockFindOne).toHaveBeenCalledWith(Plan, { id: "1" });
    });

    it("should throw error for non-existent plan", async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(PlanService.getById(mockEntityManager, "999"))
        .rejects
        .toThrow("Plan with id 999 not found");
    });
  });

  describe("update", () => {
    const updateData = {
      name: "Updated Plan",
      description: "Updated Description"
    };

    it("should update plan with valid data", async () => {
      const existingPlan = {
        id: "1",
        name: "Old Name",
        description: "Old Description",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockFindOne.mockResolvedValue(existingPlan);

      await PlanService.update(mockEntityManager, "1", updateData);

      expect(mockAssign).toHaveBeenCalledWith(
        existingPlan,
        expect.objectContaining({
          ...updateData,
          updatedAt: expect.any(Date)
        })
      );
    });

    it("should throw error for non-existent plan", async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(PlanService.update(mockEntityManager, "999", updateData))
        .rejects
        .toThrow("Plan with id 999 not found");
    });
  });

  describe("delete", () => {
    it("should delete existing plan", async () => {
      const plan = { id: "1", name: "Test Plan" };
      mockFindOne.mockResolvedValue(plan);

      await PlanService.delete(mockEntityManager, "1");

      expect(mockRemoveAndFlush).toHaveBeenCalledWith(plan);
    });

    it("should throw error when deleting non-existent plan", async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(PlanService.delete(mockEntityManager, "999"))
        .rejects
        .toThrow("Plan with id 999 not found");
    });

    it("should handle database errors during deletion", async () => {
      const plan = { id: "1", name: "Test Plan" };
      mockFindOne.mockResolvedValue(plan);
      mockRemoveAndFlush.mockRejectedValue(new Error("DB error"));

      await expect(PlanService.delete(mockEntityManager, "1"))
        .rejects
        .toThrow(PlanServiceError);
    });
  });
});