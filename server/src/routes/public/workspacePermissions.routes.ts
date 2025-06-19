import { Router, Request, Response, RequestHandler } from "express";
import { validateRequest } from "../../middleware/validation.middleware";
import { WorkspacePermissionController } from "../../controllers/public/workspacePermission.controller";
import { EntityManager } from "@mikro-orm/core";
import {
  createWorkspacePermissionSchema,
  updateWorkspacePermissionSchema,
  workspacePermissionIdParamSchema,
} from "../../validations/public/workspacePermission.validation";

/**
 * @swagger
 * tags:
 *   name: WorkspacePermissions
 *   description: Workspace permissions management endpoints
 * components:
 *   schemas:
 *     WorkspacePermission:
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
  WorkspacePermissionController
).reduce(
  (acc, [key, handler]) => ({
    ...acc,
    [key]: wrapController(handler),
  }),
  {} as Record<keyof typeof WorkspacePermissionController, RequestHandler>
);

/**
 * @swagger
 * /api/permissions/workspace:
 *   get:
 *     summary: Get all workspace permissions
 *     tags: [WorkspacePermissions]
 *     responses:
 *       200:
 *         description: List of permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WorkspacePermission'
 *       500:
 *         description: Server error
 */
router.get("/", getAll);

/**
 * @swagger
 * /api/permissions/workspace:
 *   post:
 *     summary: Create a new workspace permission
 *     tags: [WorkspacePermissions]
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
 *               $ref: '#/components/schemas/WorkspacePermission'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  validateRequest(createWorkspacePermissionSchema) as RequestHandler,
  create
);

/**
 * @swagger
 * /api/permissions/workspace/{id}:
 *   get:
 *     summary: Get a workspace permission by ID
 *     tags: [WorkspacePermissions]
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
 *               $ref: '#/components/schemas/WorkspacePermission'
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:id",
  validateRequest(workspacePermissionIdParamSchema, "params") as RequestHandler,
  getById
);

/**
 * @swagger
 * /api/permissions/workspace/{id}:
 *   patch:
 *     summary: Update a workspace permission
 *     tags: [WorkspacePermissions]
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
 *               $ref: '#/components/schemas/WorkspacePermission'
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/:id",
  validateRequest(workspacePermissionIdParamSchema, "params") as RequestHandler,
  validateRequest(updateWorkspacePermissionSchema) as RequestHandler,
  update
);

/**
 * @swagger
 * /api/permissions/workspace/{id}:
 *   delete:
 *     summary: Soft delete a workspace permission
 *     tags: [WorkspacePermissions]
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
  validateRequest(workspacePermissionIdParamSchema, "params") as RequestHandler,
  softDelete
);

export const workspacePermissionRoutes = router;
