import jwt from "jsonwebtoken";
import { tokenGenerationLimiter } from "./rateLimiter";

const ACCESS_SECRET = process.env.ACCESS_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

// 1. Secret validation
if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error("JWT secrets must be configured");
}

if (ACCESS_SECRET.length < 32 || REFRESH_SECRET.length < 32) {
  console.warn(
    "JWT secrets should be at least 32 characters for optimal security"
  );
}

interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

export async function signAccessToken(payload: TokenPayload) {
  try {
    // Rate limiting check
    await tokenGenerationLimiter.consume(payload.userId);

    return jwt.sign(
      {
        ...payload,
        type: "access",
        iss: "mutumwa-ai",
        aud: "mutumwa-api",
        sub: payload.userId,
      },
      ACCESS_SECRET,
      {
        expiresIn: "15m",
        algorithm: "HS256", // 2. Explicit algorithm specification
      }
    );
  } catch (error: any) {
    if (error.remainingPoints !== undefined) {
      throw new Error(
        `Rate limit exceeded. Try again in ${Math.round(
          error.msBeforeNext / 1000
        )} seconds`
      );
    }
    throw error;
  }
}

export function signRefreshToken(userId: string) {
  return jwt.sign(
    {
      userId,
      type: "refresh",
      iss: "mutumwa-ai",
      aud: "mutumwa-api",
      sub: userId,
    },
    REFRESH_SECRET,
    {
      expiresIn: "1d",
      algorithm: "HS256", // 2. Explicit algorithm specification
    }
  );
}

export function verifyAccessToken(
  token: string
): TokenPayload & jwt.JwtPayload {
  try {
    // 2. Algorithm specification in verification
    const decoded = jwt.verify(token, ACCESS_SECRET, {
      algorithms: ["HS256"],
    }) as TokenPayload & jwt.JwtPayload;

    if (decoded.type !== "access") {
      throw new Error("Invalid token type");
    }

    return decoded;
  } catch (error) {
    // 3. Enhanced error handling
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    }
    if (error instanceof jwt.NotBeforeError) {
      throw new Error("Token not active");
    }
    throw error; // Re-throw unexpected errors
  }
}

export function verifyRefreshToken(
  token: string
): { userId: string } & jwt.JwtPayload {
  try {
    // 2. Algorithm specification in verification
    const decoded = jwt.verify(token, REFRESH_SECRET, {
      algorithms: ["HS256"],
    }) as {
      userId: string;
      type: string;
    } & jwt.JwtPayload;

    if (decoded.type !== "refresh") {
      throw new Error("Invalid token type");
    }

    return decoded;
  } catch (error) {
    // 3. Enhanced error handling
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid refresh token");
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Refresh token expired");
    }
    if (error instanceof jwt.NotBeforeError) {
      throw new Error("Refresh token not active");
    }
    throw error; // Re-throw unexpected errors
  }
}
