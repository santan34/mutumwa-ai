import { Router, Request, Response, RequestHandler } from "express";
import { OrganisationPlanController } from "../../controllers/public/organisationPlan.controller";
import { validateRequest } from "../../middleware/validation.middleware";
import {
  createOrganisationPlanSchema,
  updateOrganisationPlanSchema,
  organisationPlanIdParamSchema,
} from "../../validations/public/organisationPlan.validation";
import { EntityManager } from "@mikro-orm/core";

/**
 * @swagger
 * tags:
 *   name: OrganisationPlans
 *   description: Organisation subscription plans management endpoints
 * components:
 *   schemas:
 *     OrganisationPlan:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         organisation:
 *           $ref: '#/components/schemas/Organisation'
 *         plan:
 *           $ref: '#/components/schemas/Plan'
 *         apiKey:
 *           type: string
 *           format: uuid
 *         apiKeyLastUsedAt:
 *           type: string
 *           format: date-time
 *         startedAt:
 *           type: string
 *           format: date-time
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
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

const { getAll, create, getById, update, softDelete } = Object.entries(
  OrganisationPlanController
).reduce(
  (acc, [key, handler]) => ({
    ...acc,
    [key]: wrapController(handler),
  }),
  {} as Record<keyof typeof OrganisationPlanController, RequestHandler>
);

/**
 * @swagger
 * /api/organisation-plans:
 *   get:
 *     summary: Get all organisation plans
 *     tags: [OrganisationPlans]
 *     responses:
 *       200:
 *         description: List of organisation plans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrganisationPlan'
 *       500:
 *         description: Server error
 */
router.get("/", getAll);

/**
 * @swagger
 * /api/organisation-plans:
 *   post:
 *     summary: Create a new organisation plan
 *     tags: [OrganisationPlans]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organisationId
 *               - planId
 *               - expiresAt
 *             properties:
 *               organisationId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the organisation
 *               planId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the plan
 *               startedAt:
 *                 type: string
 *                 format: date-time
 *                 description: Start date of the plan
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: Expiry date of the plan
 *     responses:
 *       201:
 *         description: Organisation plan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrganisationPlan'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  validateRequest(createOrganisationPlanSchema) as RequestHandler,
  create
);

/**
 * @swagger
 * /api/organisation-plans/{id}:
 *   get:
 *     summary: Get an organisation plan by ID
 *     tags: [OrganisationPlans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the organisation plan
 *     responses:
 *       200:
 *         description: Organisation plan found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrganisationPlan'
 *       404:
 *         description: Organisation plan not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:id",
  validateRequest(organisationPlanIdParamSchema, "params") as RequestHandler,
  getById
);

/**
 * @swagger
 * /api/organisation-plans/{id}:
 *   patch:
 *     summary: Update an organisation plan
 *     tags: [OrganisationPlans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the organisation plan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the new plan
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: New expiry date
 *               isActive:
 *                 type: boolean
 *                 description: Active status of the plan
 *     responses:
 *       200:
 *         description: Organisation plan updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrganisationPlan'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Organisation plan not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/:id",
  validateRequest(organisationPlanIdParamSchema, "params") as RequestHandler,
  validateRequest(updateOrganisationPlanSchema) as RequestHandler,
  update
);

/**
 * @swagger
 * /api/organisation-plans/{id}:
 *   delete:
 *     summary: Soft delete an organisation plan
 *     tags: [OrganisationPlans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the organisation plan
 *     responses:
 *       204:
 *         description: Organisation plan deleted successfully
 *       404:
 *         description: Organisation plan not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  validateRequest(organisationPlanIdParamSchema, "params") as RequestHandler,
  softDelete
);

export const organisationPlanRoutes = router;