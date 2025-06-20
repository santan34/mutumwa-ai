import { Request, Response } from "express";
import { generateMagicToken } from "../../utils/generateMagicToken";
import { MagicLinkToken, MagicLinkPurpose } from "../../entities/tenant/MagicLinkToken";
import { sendMagicLinkEmail } from "../../utils/sendMagicLinkEmail";
import { User } from "../../entities/tenant/User";
import "dotenv/config";

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

export const AuthController = {
  requestMagicLink: async (req: any, res: Response) => {
    const { email, purpose } = req.body;
    const tenantDomain = req.headers["x-tenant-domain"] as string;
    const { em } = req;

    if (!email || !tenantDomain || !purpose || ![MagicLinkPurpose.LOGIN, MagicLinkPurpose.SIGNUP].includes(purpose)) {
      res.status(400).json({ status: "error", message: "Missing or invalid email, tenant domain, or purpose" });
      return;
    }

    // For login, user must exist. For signup, user must not exist.
    const user = await em.findOne(User, { email });
    if (purpose === MagicLinkPurpose.LOGIN && !user) {
      res.status(404).json({ status: "error", message: "User not found for login" });
      return;
    }
    if (purpose === MagicLinkPurpose.SIGNUP && user) {
      res.status(400).json({ status: "error", message: "User already exists for signup" });
      return;
    }

    const token = generateMagicToken();
    const expiresAt = new Date(Date.now() + (purpose === MagicLinkPurpose.SIGNUP ? 24 * 60 * 60 * 1000 : 15 * 60 * 1000));

    const magicLinkToken = em.create(MagicLinkToken, {
      email,
      token,
      purpose,
      expiresAt,
      used: false,
    });
    await em.persistAndFlush(magicLinkToken);

    const magicLink = `http://${tenantDomain}/auth/verify?token=${token}`;
    await sendMagicLinkEmail(email, magicLink, purpose);

    res.json({ status: "success", message: "Magic link sent" });
  },

  verifyMagicLink: async (req: any, res: Response) => {
    const { token } = req.query;
    const { em } = req;

    if (!token) {
      res.status(400).json({ status: "error", message: "Missing token" });
      return;
    }

    const magicLink = await em.findOne(MagicLinkToken, { token });
    if (!magicLink) {
      res.status(400).json({ status: "error", message: "Invalid token" });
      return;
    }
    if (magicLink.expiresAt < new Date()) {
      res.status(400).json({ status: "error", message: "Token expired" });
      return;
    }
    if (magicLink.used) {
      res.status(400).json({ status: "error", message: "Token already used" });
      return;
    }

    let user = await em.findOne(User, { email: magicLink.email });
    if (magicLink.purpose === MagicLinkPurpose.LOGIN) {
      if (!user) {
        res.status(404).json({ status: "error", message: "User not found for login" });
        return;
      }
    } else if (magicLink.purpose === MagicLinkPurpose.SIGNUP) {
      if (!user) {
        user = em.create(User, { email: magicLink.email });
        await em.persistAndFlush(user);
      }
    }

    // Mark token as used
    magicLink.used = true;
    await em.persistAndFlush(magicLink);

    // Issue JWT
    const jwtPayload = { userId: user.id };
    const jwtToken = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: "1h" });

    res.json({ status: "success", token: jwtToken, email: user.email, userId: user.id });
  },
};
