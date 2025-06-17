import { Router } from "express";
import { RequestHandler, Request, Response } from "express";
import { TenantController } from "../controllers/tenant.controller";
import { EntityManager } from "@mikro-orm/core";
import { validateRequest } from "../middleware/validation.middleware";
import { createTenantSchema, updateTenantSchema, tenantIdParamSchema } from "../validations/tenant.validation";

const router = Router();

interface RequestWithEm extends Request {
  em: EntityManager;
}

const wrapController = (
  fn: (req: RequestWithEm, res: Response) => Promise<Response | void>
): RequestHandler => {
  return async (req, res, next) => {
    try {
      await fn(req as RequestWithEm, res);
    } catch (error) {
      next(error);
    }
  };
};

const {
  getAll,
  create,
  getById,
  update,
  softDelete,
  activate,
  getSoftDeleted,
} = Object.entries(TenantController).reduce(
  (acc, [key, handler]) => ({
    ...acc,
    [key]: wrapController(handler),
  }),
  {} as Record<keyof typeof TenantController, RequestHandler>
);

/**
 * @swagger
 * tags:
 *   name: Tenants
 *   description: Tenant management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Tenant:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Auto-generated unique identifier
 *         email:
 *           type: string
 *           description: User email (tenant)
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

/**
 * @swagger
 * /api/tenants:
 *   get:
 *     summary: Get all active tenants
 *     tags: [Tenants]
 *     responses:
 *       200:
 *         description: List of active tenants
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
 *                     $ref: '#/components/schemas/Tenant'
 */
router.get("/", getAll);

/**
 * @swagger
 * /api/tenants:
 *   post:
 *     summary: Create a new tenant
 *     tags: [Tenants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tenant'
 *     responses:
 *       201:
 *         description: Tenant created successfully
 *       400:
 *         description: Invalid input data
 */
router.post(
  "/",
  validateRequest(createTenantSchema) as RequestHandler,
  create
);

/**
 * @swagger
 * /api/tenants/deleted:
 *   get:
 *     summary: Get all soft-deleted tenants
 *     tags: [Tenants]
 *     responses:
 *       200:
 *         description: List of deleted tenants
 */
router.get("/deleted", getSoftDeleted);

/**
 * @swagger
 * /api/tenants/{id}:
 *   get:
 *     summary: Get a tenant by ID
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tenant details
 *       404:
 *         description: Tenant not found
 */
router.get(
  "/:id",
  validateRequest(tenantIdParamSchema, "params") as RequestHandler,
  getById
);

/**
 * @swagger
 * /api/tenants/{id}:
 *   patch:
 *     summary: Update a tenant by ID
 *     tags: [Tenants]
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
 *             $ref: '#/components/schemas/Tenant'
 *     responses:
 *       200:
 *         description: Tenant updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Tenant not found
 */
router.patch(
  "/:id",
  validateRequest(tenantIdParamSchema, "params") as RequestHandler,
  validateRequest(updateTenantSchema) as RequestHandler,
  update
);

/**
 * @swagger
 * /api/tenants/{id}:
 *   delete:
 *     summary: Soft delete a tenant by ID
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Tenant soft deleted successfully
 *       404:
 *         description: Tenant not found
 */
router.delete(
  "/:id",
  validateRequest(tenantIdParamSchema, "params") as RequestHandler,
  softDelete
);

/**
 * @swagger
 * /api/tenants/{id}/activate:
 *   post:
 *     summary: Activate a soft-deleted tenant by ID
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tenant activated successfully
 *       404:
 *         description: Tenant not found
 */
router.post(
  "/:id/activate",
  validateRequest(tenantIdParamSchema, "params") as RequestHandler,
  activate
);

export const tenantRoutes = router;
