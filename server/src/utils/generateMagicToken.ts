import crypto from "crypto";
export function generateMagicToken() {
  return crypto.randomBytes(32).toString("hex");
}