import { Router, Request, Response, RequestHandler } from "express";
import { UserController } from "../../controllers/tenant/user.controller";
import { validateRequest } from "../../middleware/validation.middleware";
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
} from "../../validations/tenant/user.validation";
import { EntityManager } from "@mikro-orm/core";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Tenant-specific user management endpoints
 * components:
 *   parameters:
 *     TenantDomainHeader:
 *       in: header
 *       name: X-Tenant-Domain
 *       schema:
 *         type: string
 *       required: true
 *       description: Domain identifier for the tenant
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the user
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the user was last updated
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Timestamp when the user was soft-deleted (null if not deleted)
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
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
  delete: deleteUser,
} = Object.entries(UserController).reduce(
  (acc, [key, handler]) => ({
    ...acc,
    [key]: wrapController(handler),
  }),
  {} as Record<keyof typeof UserController, RequestHandler>
);

/**
 * @swagger
 * /api/tenant/users:
 *   get:
 *     summary: Get all users for a tenant
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/TenantDomainHeader'
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", getAll);

/**
 * @swagger
 * /api/tenant/users:
 *   post:
 *     summary: Create a new user for a tenant
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/TenantDomainHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post("/", validateRequest(createUserSchema) as RequestHandler, create);

/**
 * @swagger
 * /api/tenant/users/{id}:
 *   get:
 *     summary: Get a tenant user by ID
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/TenantDomainHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the user
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:id",
  validateRequest(userIdParamSchema, "params") as RequestHandler,
  getById
);

/**
 * @swagger
 * /api/tenant/users/{id}:
 *   patch:
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/TenantDomainHeader'
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
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/:id",
  validateRequest(userIdParamSchema, "params") as RequestHandler,
  validateRequest(updateUserSchema) as RequestHandler,
  update
);

/**
 * @swagger
 * /api/tenant/users/{id}:
 *   delete:
 *     summary: Soft delete a user
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/TenantDomainHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User soft-deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  validateRequest(userIdParamSchema, "params") as RequestHandler,
  deleteUser
);

/**
 * @swagger
 * /api/tenant/users/{id}/restore:
 *   post:
 *     summary: Restore a soft-deleted tenant user
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/TenantDomainHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User restored successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post(
  "/:id/restore",
  validateRequest(userIdParamSchema, "params") as RequestHandler,
  wrapController(UserController.restore)
);

/**
 * @swagger
 * /api/tenant/users/{id}/permanent:
 *   delete:
 *     summary: Permanently delete a tenant user
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/TenantDomainHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User permanently deleted
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id/permanent",
  validateRequest(userIdParamSchema, "params") as RequestHandler,
  wrapController(UserController.permanentDelete)
);

export const userRoutes = router;
