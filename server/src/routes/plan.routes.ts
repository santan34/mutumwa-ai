import { Router, Request, Response, RequestHandler } from "express";
import { PlanController } from "../controllers/plan.controller";
import { validateRequest } from "../middleware/validation.middleware";
import {
  createPlanSchema,
  updatePlanSchema,
  planIdParamSchema,
} from "../validations/plan.validation";
import { EntityManager } from "@mikro-orm/core";

/**
 * @swagger
 * tags:
 *   name: Plans
 *   description: Plan management endpoints
 * components:
 *   schemas:
 *     Plan:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
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
 *     tags: [Plans]
 *     responses:
 *       200:
 *         description: List of plans retrieved successfully
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
