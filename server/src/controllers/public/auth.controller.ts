import { Request, Response } from "express";
import { generateMagicToken } from "../../utils/generateMagicToken";
import { MagicLinkToken } from "../../entities/tenant/MagicLinkToken";
import { sendMagicLinkEmail } from "../../utils/sendMagicLinkEmail";
import { User } from "../../entities/tenant/User";
import "dotenv/config";

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

export const AuthController = {
  requestMagicLink: async (req: any, res: Response) => {
    const { email } = req.body;
    const tenantDomain = req.headers["x-tenant-domain"] as string;
    const { em } = req;

    if (!email || !tenantDomain) {
      res.status(400).json({ status: "error", message: "Missing email or tenant domain" });
      return;
    }

    let user = await em.findOne(User, { email });
    if (!user) {
    // Create new user for sign up
        const newUser = em.create(User, { email });
        await em.persistAndFlush(newUser);
        user = newUser;
    }

    const token = generateMagicToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry

    const magicLinkToken = em.create(MagicLinkToken, { user, token, expiresAt });
    await em.persistAndFlush(magicLinkToken);

    const magicLink = `https://${tenantDomain}/auth/verify?token=${token}&tenant=${tenantDomain}`;
    await sendMagicLinkEmail(email, magicLink);

    res.json({ status: "success", message: "Magic link sent" });
  },

  verifyMagicLink: async (req: any, res: Response) => {
    const { token, tenant } = req.query;
    const { em } = req;

    if (!token || !tenant) {
      res.status(400).json({ status: "error", message: "Missing token or tenant" });
      return;
    }

    const magicLink = await em.findOne(MagicLinkToken, { token });
    if (!magicLink || magicLink.expiresAt < new Date()) {
      res.status(400).json({ status: "error", message: "Invalid or expired token" });
      return;
    }

    const user = magicLink.user;
    await em.removeAndFlush(magicLink); // Invalidate token

    // Issue JWT
    const jwtPayload = { userId: user.id, tenant };
    const jwtToken = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: "1h" });

    res.json({ status: "success", token: jwtToken });
  },
};
