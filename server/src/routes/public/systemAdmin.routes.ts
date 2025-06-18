import { Router, Request, Response, RequestHandler } from "express";
import { SystemAdminController } from "../../controllers/public/systemAdmin.controller";
import { validateRequest } from "../../middleware/validation.middleware";
import {
  createSystemAdminSchema,
  updateSystemAdminSchema,
  adminIdParamSchema,
} from "../../validations/public/systemAdmin.validation";
import { EntityManager } from "@mikro-orm/core";

/**
 * @swagger
 * tags:
 *   name: SystemAdmins
 *   description: System administrator management endpoints
 * components:
 *   schemas:
 *     SystemAdmin:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         name:
 *           type: string
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

const { getAll, create, getById, update, toggleActive } = Object.entries(
  SystemAdminController
).reduce(
  (acc, [key, handler]) => ({
    ...acc,
    [key]: wrapController(handler),
  }),
  {} as Record<keyof typeof SystemAdminController, RequestHandler>
);

/**
 * @swagger
 * /api/system-admins:
 *   get:
 *     summary: Get all system administrators
 *     tags: [SystemAdmins]
 *     responses:
 *       200:
 *         description: List of system administrators retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SystemAdmin'
 *       500:
 *         description: Server error
 */
router.get("/", getAll);

/**
 * @swagger
 * /api/system-admins:
 *   post:
 *     summary: Create a new system administrator
 *     tags: [SystemAdmins]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the system administrator
 *               name:
 *                 type: string
 *                 description: Full name of the system administrator
 *     responses:
 *       201:
 *         description: System administrator created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SystemAdmin'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  validateRequest(createSystemAdminSchema) as RequestHandler,
  create
);

/**
 * @swagger
 * /api/system-admins/{id}:
 *   get:
 *     summary: Get a system administrator by ID
 *     tags: [SystemAdmins]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the system administrator
 *     responses:
 *       200:
 *         description: System administrator found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SystemAdmin'
 *       404:
 *         description: System administrator not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:id",
  validateRequest(adminIdParamSchema, "params") as RequestHandler,
  getById
);

/**
 * @swagger
 * /api/system-admins/{id}:
 *   patch:
 *     summary: Update a system administrator
 *     tags: [SystemAdmins]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the system administrator
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: System administrator updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SystemAdmin'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: System administrator not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/:id",
  validateRequest(adminIdParamSchema, "params") as RequestHandler,
  validateRequest(updateSystemAdminSchema) as RequestHandler,
  update
);

/**
 * @swagger
 * /api/system-admins/{id}/toggle-active:
 *   patch:
 *     summary: Toggle active status of a system administrator
 *     tags: [SystemAdmins]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the system administrator
 *     responses:
 *       200:
 *         description: Active status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SystemAdmin'
 *       404:
 *         description: System administrator not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/:id/toggle-active",
  validateRequest(adminIdParamSchema, "params") as RequestHandler,
  toggleActive
);

export const systemAdminRoutes = router;
