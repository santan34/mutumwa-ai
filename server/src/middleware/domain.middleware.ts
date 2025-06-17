import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      domain?: string;
    }
  }
}

export const extractDomain = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const host = req.headers.host; // e.g
  const domain = host; // Extract the domain from the host header
  if (!domain) {
    return res.status(400).json({ error: "Domain not found" });
  }
  req.domain = domain; // Attach the domain to the request object
  console.log(`Extracted domain: ${domain}`); // Log the extracted domain
  next();
};
