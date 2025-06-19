import { Router, Request, Response, RequestHandler } from "express";
import { PlanController } from "../../controllers/public/plan.controller";
import { validateRequest } from "../../middleware/validation.middleware";
import {
  createPlanSchema,
  updatePlanSchema,
  planIdParamSchema,
} from "../../validations/public/plan.validation";
import { EntityManager } from "@mikro-orm/core";

/**
 * @swagger
 * components:
 *   schemas:
 *     Plan:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The unique identifier for the plan
 *         name:
 *           type: string
 *           description: The name of the plan
 *         description:
 *           type: string
 *           description: Detailed description of what the plan offers
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the plan was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the plan was last updated
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         name: "Premium Plan"
 *         description: "Access to all premium features"
 *         createdAt: "2025-01-01T00:00:00.000Z"
 *         updatedAt: "2025-01-01T00:00:00.000Z"
 *   responses:
 *     NotFound:
 *       description: The specified resource was not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: error
 *               message:
 *                 type: string
 *                 example: Plan with id 123 not found
 *     ServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: error
 *               message:
 *                 type: string
 *                 example: Internal server error
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
  getById,
  update,
  delete: deletePlan,
} = Object.entries(PlanController).reduce(
  (acc, [key, handler]) => ({
    ...acc,
    [key]: wrapController(handler),
  }),
  {} as Record<keyof typeof PlanController, RequestHandler>
);

/**
 * @swagger
 * /api/plans:
 *   get:
 *     summary: Get all plans
 *     description: Retrieve a list of all available plans
 *     tags: [Plans]
 *     responses:
 *       200:
 *         description: List of plans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Plan'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Create a new plan
 *     description: Create a new subscription plan
 *     tags: [Plans]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Basic Plan"
 *               description:
 *                 type: string
 *                 example: "Basic features for starters"
 *     responses:
 *       201:
 *         description: Plan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Plan'
 *       400:
 *         description: Invalid request body
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/plans/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *       description: The plan ID
 *   get:
 *     summary: Get a plan by ID
 *     description: Retrieve a specific plan by its ID
 *     tags: [Plans]
 *     responses:
 *       200:
 *         description: Plan retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Plan'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   patch:
 *     summary: Update a plan
 *     description: Update an existing plan's details
 *     tags: [Plans]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Plan updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Plan'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Delete a plan
 *     description: Delete an existing plan
 *     tags: [Plans]
 *     responses:
 *       200:
 *         description: Plan deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Plan deleted successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/", getAll);

/**
 * @swagger
 * /api/plans:
 *   post:
 *     summary: Create a new plan
 *     tags: [Plans]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 */
router.post("/", validateRequest(createPlanSchema) as RequestHandler, create);

/**
 * @swagger
 * /api/plans/{id}:
 *   get:
 *     summary: Get a plan by ID
 *     tags: [Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 */
router.get(
  "/:id",
  validateRequest(planIdParamSchema, "params") as RequestHandler,
  getById
);

/**
 * @swagger
 * /api/plans/{id}:
 *   patch:
 *     summary: Update a plan
 *     tags: [Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 */
router.patch(
  "/:id",
  validateRequest(planIdParamSchema, "params") as RequestHandler,
  validateRequest(updatePlanSchema) as RequestHandler,
  update
);

/**
 * @swagger
 * /api/plans/{id}:
 *   delete:
 *     summary: Delete a plan
 *     tags: [Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 */
router.delete(
  "/:id",
  validateRequest(planIdParamSchema, "params") as RequestHandler,
  deletePlan
);

export const planRoutes = router;
