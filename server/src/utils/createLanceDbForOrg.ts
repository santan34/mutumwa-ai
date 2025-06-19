import fs from 'fs';
import path from 'path';
// @ts-ignore
import * as lancedb from "@lancedb/lancedb";// Ensure lancedb is installed

/**
 * Creates a new LanceDB database for an organisation.
 * @param orgId - The organisation's unique ID.
 * @returns The path to the created LanceDB database.
 */
export async function createLanceDbForOrg(orgId: string): Promise<string> {
  const baseDir = !!process.env.STORAGE_DIR ? `${process.env.STORAGE_DIR}/lancedb` : path.resolve(__dirname, '../storage/lancedb');
  const orgDbDir = path.join(baseDir, orgId);

  // Ensure the directory exists
  if (!fs.existsSync(orgDbDir)) {
    fs.mkdirSync(orgDbDir, { recursive: true });
  }

  // Initialize a new LanceDB database (adjust API if needed)
  await lancedb.connect(orgDbDir);

  // Optionally, create a default table/collection here
  // await db.createTable('vectors', { /* schema definition */ });

  return orgDbDir;
}
