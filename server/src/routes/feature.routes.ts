import { Router, Request, Response, RequestHandler } from "express";
import { FeatureController } from "../controllers/feature.controller";
import { validateRequest } from "../middleware/validation.middleware";
import {
  createFeatureSchema,
  updateFeatureSchema,
  featureIdParamSchema,
} from "../validations/feature.validation";
import { EntityManager } from "@mikro-orm/core";

/**
 * @swagger
 * components:
 *   schemas:
 *     Feature:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The unique identifier for the feature
 *         name:
 *           type: string
 *           description: The name of the feature
 *         endpointPath:
 *           type: string
 *           description: The API endpoint path for this feature
 *         description:
 *           type: string
 *           description: Detailed description of the feature
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the feature was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the feature was last updated
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the feature was soft deleted (if applicable)
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         name: "API Access"
 *         endpointPath: "/api/v1/access"
 *         description: "Access to core API functionality"
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
 *                 example: Feature with id 123 not found
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
 *
 * /api/features:
 *   get:
 *     summary: Get all features
 *     description: Retrieve a list of all active features (non-deleted)
 *     tags: [Features]
 *     responses:
 *       200:
 *         description: List of features retrieved successfully
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
 *                     $ref: '#/components/schemas/Feature'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Create a new feature
 *     description: Create a new feature with specified details
 *     tags: [Features]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - endpointPath
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Data Export"
 *               endpointPath:
 *                 type: string
 *                 example: "/api/v1/export"
 *               description:
 *                 type: string
 *                 example: "Export data in various formats"
 *     responses:
 *       201:
 *         description: Feature created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Feature'
 *       400:
 *         description: Invalid request body
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/features/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *       description: The feature ID
 *   get:
 *     summary: Get a feature by ID
 *     description: Retrieve a specific feature by its ID (if not deleted)
 *     tags: [Features]
 *     responses:
 *       200:
 *         description: Feature retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Feature'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   patch:
 *     summary: Update a feature
 *     description: Update an existing feature's details
 *     tags: [Features]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               endpointPath:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feature updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Feature'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Soft delete a feature
 *     description: Soft delete an existing feature (sets deletedAt timestamp)
 *     tags: [Features]
 *     responses:
 *       200:
 *         description: Feature soft deleted successfully
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
 *                   example: Feature deleted successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
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
  delete: deleteFeature,
} = Object.entries(FeatureController).reduce(
  (acc, [key, handler]) => ({
    ...acc,
    [key]: wrapController(handler),
  }),
  {} as Record<keyof typeof FeatureController, RequestHandler>
);

router.get("/", getAll);
router.post(
  "/",
  validateRequest(createFeatureSchema) as RequestHandler,
  create
);
router.get(
  "/:id",
  validateRequest(featureIdParamSchema, "params") as RequestHandler,
  getById
);
router.patch(
  "/:id",
  validateRequest(featureIdParamSchema, "params") as RequestHandler,
  validateRequest(updateFeatureSchema) as RequestHandler,
  update
);
router.delete(
  "/:id",
  validateRequest(featureIdParamSchema, "params") as RequestHandler,
  deleteFeature
);

export const featureRoutes = router;
