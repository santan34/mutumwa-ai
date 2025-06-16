import { Router } from "express";
import { RequestHandler, Request, Response } from "express";
import { OrganisationController } from "../controllers/organisation.controller";
import { validateRequest } from "../middleware/validation.middleware";
import { EntityManager } from "@mikro-orm/core";
import {
  createOrganisationSchema,
  updateOrganisationSchema,
  orgIdParamSchema,
} from "../validations/organisation.validation";

/**
 * @swagger
 * tags:
 *   name: Organisations
 *   description: Organisation management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Organisation:
 *       type: object
 *       required:
 *         - name
 *         - domain
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Auto-generated unique identifier
 *         name:
 *           type: string
 *           description: Organisation name
 *         domain:
 *           type: string
 *           description: Organisation domain
 *         sector:
 *           type: string
 *           description: Organisation sector
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 */

const router = Router();

// Add RequestWithEm interface
interface RequestWithEm extends Request {
  em: EntityManager;
}

// Create type-safe wrapper for controller methods
const wrapController = (
  fn: (req: RequestWithEm, res: Response) => Promise<Response>
): RequestHandler => {
  return async (req, res, next) => {
    try {
      // Cast the regular request to RequestWithEm since middleware adds 'em'
      await fn(req as RequestWithEm, res);
    } catch (error) {
      next(error);
    }
  };
};

// Wrap controller methods
const {
  getAll,
  create,
  getById,
  update,
  softDelete,
  activate,
  getSoftDeleted,
} = Object.entries(OrganisationController).reduce(
  (acc, [key, handler]) => ({
    ...acc,
    [key]: wrapController(handler),
  }),
  {} as Record<keyof typeof OrganisationController, RequestHandler>
);

/**
 * @swagger
 * /api/organisations:
 *   get:
 *     summary: Get all active organisations
 *     tags: [Organisations]
 *     responses:
 *       200:
 *         description: List of active organisations
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
 *                     $ref: '#/components/schemas/Organisation'
 */
router.get("/", getAll);

/**
 * @swagger
 * /api/organisations:
 *   post:
 *     summary: Create a new organisation
 *     tags: [Organisations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - domain
 *             properties:
 *               name:
 *                 type: string
 *               domain:
 *                 type: string
 *               sector:
 *                 type: string
 *     responses:
 *       201:
 *         description: Organisation created successfully
 *       400:
 *         description: Invalid input data
 */
router.post(
  "/",
  validateRequest(createOrganisationSchema) as RequestHandler,
  create
);

/**
 * @swagger
 * /api/organisations/deleted:
 *   get:
 *     summary: Get all soft-deleted organisations
 *     tags: [Organisations]
 *     responses:
 *       200:
 *         description: List of deleted organisations
 */
router.get("/deleted", getSoftDeleted);

/**
 * @swagger
 * /api/organisations/{id}:
 *   get:
 *     summary: Get an organisation by ID
 *     tags: [Organisations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Organisation details
 *       404:
 *         description: Organisation not found
 */
router.get(
  "/:id",
  validateRequest(orgIdParamSchema, "params") as RequestHandler,
  getById
);

/**
 * @swagger
 * /api/organisations/{id}:
 *   patch:
 *     summary: Update an organisation by ID
 *     tags: [Organisations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               domain:
 *                 type: string
 *               sector:
 *                 type: string
 *     responses:
 *       200:
 *         description: Organisation updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Organisation not found
 */
router.patch(
  "/:id",
  validateRequest(orgIdParamSchema, "params") as RequestHandler,
  validateRequest(updateOrganisationSchema) as RequestHandler,
  update
);

/**
 * @swagger
 * /api/organisations/{id}:
 *   delete:
 *     summary: Soft delete an organisation by ID
 *     tags: [Organisations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Organisation soft deleted successfully
 *       404:
 *         description: Organisation not found
 */
router.delete(
  "/:id",
  validateRequest(orgIdParamSchema, "params") as RequestHandler,
  softDelete
);

/**
 * @swagger
 * /api/organisations/{id}/activate:
 *   post:
 *     summary: Activate a soft-deleted organisation by ID
 *     tags: [Organisations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Organisation activated successfully
 *       404:
 *         description: Organisation not found
 */
router.post(
  "/:id/activate",
  validateRequest(orgIdParamSchema, "params") as RequestHandler,
  activate
);

export const organisationRoutes = router;
