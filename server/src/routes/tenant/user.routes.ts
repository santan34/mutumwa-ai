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
 *   description: User management endpoints
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
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
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 */
router.get("/", getAll);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 */
router.post("/", validateRequest(createUserSchema) as RequestHandler, create);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get(
  "/:id",
  validateRequest(userIdParamSchema, "params") as RequestHandler,
  getById
);

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: User not found
 */
router.patch(
  "/:id",
  validateRequest(userIdParamSchema, "params") as RequestHandler,
  validateRequest(updateUserSchema) as RequestHandler,
  update
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Soft delete a user
 *     tags: [Users]
 *     parameters:
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
 */
router.delete(
  "/:id",
  validateRequest(userIdParamSchema, "params") as RequestHandler,
  deleteUser
);

/**
 * @swagger
 * /api/users/{id}/restore:
 *   post:
 *     summary: Restore a soft-deleted user
 *     tags: [Users]
 *     parameters:
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
 *         description: User not found or not deleted
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
 * /api/users/{id}/permanent:
 *   delete:
 *     summary: Permanently delete a user
 *     tags: [Users]
 *     parameters:
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
