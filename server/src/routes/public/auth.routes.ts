import { Router } from "express";
import { tenantResolverMiddleware } from "../../middleware/tenantResolver.middleware";
import { AuthController } from "../../controllers/public/auth.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints (magic link)
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
 *     MagicLinkRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *     MagicLinkResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *         message:
 *           type: string
 *     MagicLinkVerifyResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *         token:
 *           type: string
 */

/**
 * @swagger
 * /api/auth/magic-link:
 *   post:
 *     summary: Request a magic login link (sign up or login)
 *     tags: [Auth]
 *     parameters:
 *       - $ref: '#/components/parameters/TenantDomainHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MagicLinkRequest'
 *     responses:
 *       200:
 *         description: Magic link sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MagicLinkResponse'
 *       400:
 *         description: Missing email or tenant domain
 *       404:
 *         description: User not found (if not auto-registering)
 */
router.post("/magic-link", tenantResolverMiddleware, AuthController.requestMagicLink);

/**
 * @swagger
 * /api/auth/verify-magic-link:
 *   get:
 *     summary: Verify a magic link and receive a JWT
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Magic link token
 *       - in: query
 *         name: tenant
 *         schema:
 *           type: string
 *         required: true
 *         description: Tenant domain
 *       - $ref: '#/components/parameters/TenantDomainHeader'
 *     responses:
 *       200:
 *         description: JWT issued
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MagicLinkVerifyResponse'
 *       400:
 *         description: Invalid or expired token
 */
router.get("/verify-magic-link", tenantResolverMiddleware, AuthController.verifyMagicLink);

export default router;
