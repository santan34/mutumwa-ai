import { Router, Request, Response, RequestHandler } from "express";
import { ApiUsageController } from "../../controllers/public/apiUsage.controller";
import { validateRequest } from "../../middleware/validation.middleware";
import {
  createApiUsageSchema,
  updateApiUsageSchema,
  apiUsageParamSchema,
} from "../../validations/public/apiUsage.validation";
import { EntityManager } from "@mikro-orm/core";

/**
 * @swagger
 * tags:
 *   name: ApiUsage
 *   description: API usage tracking and monitoring endpoints
 * components:
 *   schemas:
 *     ApiUsage:
 *       type: object
 *       properties:
 *         organisation:
 *           $ref: '#/components/schemas/Organisation'
 *         feature:
 *           $ref: '#/components/schemas/Feature'
 *         periodStart:
 *           type: string
 *           format: date-time
 *         usageCount:
 *           type: integer
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

const { getAll, create, getByKeys, update, incrementUsage } = Object.entries(
  ApiUsageController
).reduce(
  (acc, [key, handler]) => ({
    ...acc,
    [key]: wrapController(handler),
  }),
  {} as Record<keyof typeof ApiUsageController, RequestHandler>
);

/**
 * @swagger
 * /api/usage:
 *   get:
 *     summary: Get all API usage records
 *     tags: [ApiUsage]
 *     responses:
 *       200:
 *         description: List of API usage records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ApiUsage'
 *       500:
 *         description: Server error
 */
router.get("/", getAll);

/**
 * @swagger
 * /api/usage:
 *   post:
 *     summary: Create a new API usage record
 *     tags: [ApiUsage]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organisationId
 *               - featureId
 *               - periodStart
 *               - usageCount
 *             properties:
 *               organisationId:
 *                 type: string
 *                 format: uuid
 *                 description: Organisation's unique identifier
 *               featureId:
 *                 type: string
 *                 format: uuid
 *                 description: Feature's unique identifier
 *               periodStart:
 *                 type: string
 *                 format: date-time
 *                 description: Start of the usage period
 *               usageCount:
 *                 type: integer
 *                 minimum: 0
 *                 description: Initial usage count
 *     responses:
 *       201:
 *         description: API usage record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiUsage'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  validateRequest(createApiUsageSchema) as RequestHandler,
  create
);

/**
 * @swagger
 * /api/usage/{organisationId}/{featureId}/{periodStart}:
 *   get:
 *     summary: Get API usage by keys
 *     tags: [ApiUsage]
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the organisation
 *       - in: path
 *         name: featureId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the feature
 *       - in: path
 *         name: periodStart
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start of the usage period
 *     responses:
 *       200:
 *         description: API usage record found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiUsage'
 *       404:
 *         description: API usage record not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:organisationId/:featureId/:periodStart",
  validateRequest(apiUsageParamSchema, "params") as RequestHandler,
  getByKeys
);

/**
 * @swagger
 * /api/usage/{organisationId}/{featureId}/{periodStart}:
 *   patch:
 *     summary: Update an API usage record
 *     tags: [ApiUsage]
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the organisation
 *       - in: path
 *         name: featureId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the feature
 *       - in: path
 *         name: periodStart
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start of the usage period
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usageCount:
 *                 type: integer
 *                 minimum: 0
 *                 description: New usage count value
 *     responses:
 *       200:
 *         description: API usage record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiUsage'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: API usage record not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/:organisationId/:featureId/:periodStart",
  validateRequest(apiUsageParamSchema, "params") as RequestHandler,
  validateRequest(updateApiUsageSchema) as RequestHandler,
  update
);

/**
 * @swagger
 * /api/usage/{organisationId}/{featureId}/{periodStart}/increment:
 *   patch:
 *     summary: Increment usage count for an API usage record
 *     tags: [ApiUsage]
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the organisation
 *       - in: path
 *         name: featureId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the feature
 *       - in: path
 *         name: periodStart
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start of the usage period
 *     responses:
 *       200:
 *         description: Usage count incremented successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiUsage'
 *       404:
 *         description: API usage record not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/:organisationId/:featureId/:periodStart/increment",
  validateRequest(apiUsageParamSchema, "params") as RequestHandler,
  incrementUsage
);

export const apiUsageRoutes = router;
