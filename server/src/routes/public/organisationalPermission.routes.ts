import { Router, Request, Response, RequestHandler } from "express";
import { validateRequest } from "../../middleware/validation.middleware";
import { OrganisationalPermissionController } from "../../controllers/public/organisationalPermission.controller";
import { EntityManager } from "@mikro-orm/core";
import {
  createOrganisationalPermissionSchema,
  updateOrganisationalPermissionSchema,
  organisationalPermissionIdParamSchema,
} from "../../validations/public/organisationalPermission.validation";

/**
 * @swagger
 * tags:
 *   name: OrganisationalPermissions
 *   description: Organisational permissions management endpoints
 * components:
 *   schemas:
 *     OrganisationalPermission:
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

const { getAll, create, getById, update, softDelete } = Object.entries(
  OrganisationalPermissionController
).reduce(
  (acc, [key, handler]) => ({
    ...acc,
    [key]: wrapController(handler),
  }),
  {} as Record<keyof typeof OrganisationalPermissionController, RequestHandler>
);

/**
 * @swagger
 * /api/permissions/organisational:
 *   get:
 *     summary: Get all organisational permissions
 *     tags: [OrganisationalPermissions]
 *     responses:
 *       200:
 *         description: List of permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrganisationalPermission'
 *       500:
 *         description: Server error
 */
router.get("/", getAll);

/**
 * @swagger
 * /api/permissions/organisational:
 *   post:
 *     summary: Create a new organisational permission
 *     tags: [OrganisationalPermissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the permission
 *               description:
 *                 type: string
 *                 description: Description of the permission
 *     responses:
 *       201:
 *         description: Permission created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrganisationalPermission'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  validateRequest(createOrganisationalPermissionSchema) as RequestHandler,
  create
);

/**
 * @swagger
 * /api/permissions/organisational/{id}:
 *   get:
 *     summary: Get a permission by ID
 *     tags: [OrganisationalPermissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the permission
 *     responses:
 *       200:
 *         description: Permission found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrganisationalPermission'
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:id",
  validateRequest(
    organisationalPermissionIdParamSchema,
    "params"
  ) as RequestHandler,
  getById
);

/**
 * @swagger
 * /api/permissions/organisational/{id}:
 *   patch:
 *     summary: Update a permission
 *     tags: [OrganisationalPermissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the permission
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name of the permission
 *               description:
 *                 type: string
 *                 description: New description of the permission
 *     responses:
 *       200:
 *         description: Permission updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrganisationalPermission'
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/:id",
  validateRequest(
    organisationalPermissionIdParamSchema,
    "params"
  ) as RequestHandler,
  validateRequest(updateOrganisationalPermissionSchema) as RequestHandler,
  update
);

/**
 * @swagger
 * /api/permissions/organisational/{id}:
 *   delete:
 *     summary: Soft delete a permission
 *     tags: [OrganisationalPermissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the permission
 *     responses:
 *       204:
 *         description: Permission deleted successfully
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  validateRequest(
    organisationalPermissionIdParamSchema,
    "params"
  ) as RequestHandler,
  softDelete
);

export const organisationalPermissionRoutes = router;
