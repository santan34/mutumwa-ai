import { Router, Request, Response, RequestHandler } from "express";
import { validateRequest } from "../../middleware/validation.middleware";
import { PlanFeatureController } from "../../controllers/public/planFeatures.controller";
import { EntityManager } from "@mikro-orm/core";
import {
  createPlanFeatureSchema,
  updatePlanFeatureSchema,
  planFeatureParamSchema,
} from "../../validations/public/planFeatures.validation";

/**
 * @swagger
 * tags:
 *   name: PlanFeatures
 *   description: Plan features management endpoints
 * components:
 *   schemas:
 *     PlanFeature:
 *       type: object
 *       properties:
 *         plan:
 *           $ref: '#/components/schemas/Plan'
 *         feature:
 *           $ref: '#/components/schemas/Feature'
 *         rateLimit:
 *           type: number
 *         period:
 *           type: string
 *           enum: [HOURLY, DAILY, MONTHLY, YEARLY]
 *         createdAt:
 *           type: string
 *           format: date-time
 */

const router = Router();

interface RequestWithEm extends Request {
  em: EntityManager;
}

const wrapController = (
  fn: (req: RequestWithEm, res: Response) => Promise<Response>
): RequestHandler => {
  return async (req: Request, res: Response) => {
    await fn(req as RequestWithEm, res);
  };
};

const {
  getAll,
  create,
  getByIds,
  update,
  delete: deletePlanFeature,
} = Object.entries(PlanFeatureController).reduce(
  (acc, [key, handler]) => ({
    ...acc,
    [key]: wrapController(handler),
  }),
  {} as Record<keyof typeof PlanFeatureController, RequestHandler>
);

/**
 * @swagger
 * /api/plan-features:
 *   get:
 *     summary: Get all plan features
 *     tags: [PlanFeatures]
 *     responses:
 *       200:
 *         description: List of plan features retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlanFeature'
 *       500:
 *         description: Server error
 */
router.get("/", getAll);

/**
 * @swagger
 * /api/plan-features:
 *   post:
 *     summary: Create a new plan feature
 *     tags: [PlanFeatures]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *               - featureId
 *             properties:
 *               planId:
 *                 type: string
 *                 format: uuid
 *               featureId:
 *                 type: string
 *                 format: uuid
 *               rateLimit:
 *                 type: number
 *               period:
 *                 type: string
 *                 enum: [HOURLY, DAILY, MONTHLY, YEARLY]
 *     responses:
 *       201:
 *         description: Plan feature created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanFeature'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  validateRequest(createPlanFeatureSchema) as RequestHandler,
  create
);

/**
 * @swagger
 * /api/plan-features/{planId}/{featureId}:
 *   get:
 *     summary: Get a plan feature by plan ID and feature ID
 *     tags: [PlanFeatures]
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the plan
 *       - in: path
 *         name: featureId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the feature
 *     responses:
 *       200:
 *         description: Plan feature found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanFeature'
 *       404:
 *         description: Plan feature not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:planId/:featureId",
  validateRequest(planFeatureParamSchema, "params") as RequestHandler,
  getByIds
);

/**
 * @swagger
 * /api/plan-features/{planId}/{featureId}:
 *   patch:
 *     summary: Update a plan feature
 *     tags: [PlanFeatures]
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the plan
 *       - in: path
 *         name: featureId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the feature
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rateLimit:
 *                 type: number
 *               period:
 *                 type: string
 *                 enum: [HOURLY, DAILY, MONTHLY, YEARLY]
 *     responses:
 *       200:
 *         description: Plan feature updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanFeature'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Plan feature not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/:planId/:featureId",
  validateRequest(planFeatureParamSchema, "params") as RequestHandler,
  validateRequest(updatePlanFeatureSchema) as RequestHandler,
  update
);

/**
 * @swagger
 * /api/plan-features/{planId}/{featureId}:
 *   delete:
 *     summary: Delete a plan feature
 *     tags: [PlanFeatures]
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the plan
 *       - in: path
 *         name: featureId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the feature
 *     responses:
 *       204:
 *         description: Plan feature deleted successfully
 *       404:
 *         description: Plan feature not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:planId/:featureId",
  validateRequest(planFeatureParamSchema, "params") as RequestHandler,
  deletePlanFeature
);

export const planFeatureRoutes = router;
