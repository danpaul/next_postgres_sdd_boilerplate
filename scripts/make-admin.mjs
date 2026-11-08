/*
 * Promotes a user to admin: `npm run make-admin -- <email>`.
 * `makeAdmin` is exported for tests; the CLI entry runs only when executed directly.
 */
import "dotenv/config";
import { pathToFileURL } from "node:url";
import pg from "pg";

/**
 * @param {{ query: pg.Pool["query"] }} db
 * @param {string | undefined} email
 * @returns {Promise<string>} The normalized email that was promoted.
 */
export async function makeAdmin(db, email) {
  const normalized = (email ?? "").trim().toLowerCase();
  if (normalized === "") {
    throw new Error("Usage: npm run make-admin -- <email>");
  }
  const { rowCount } = await db.query(
    'UPDATE "user" SET role = \'admin\', "updatedAt" = now() WHERE email = $1',
    [normalized],
  );
  if (rowCount === 0) {
    throw new Error(`No user with email ${normalized}`);
  }
  return normalized;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const email = await makeAdmin(pool, process.argv[2]);
    console.log(`Promoted ${email} to admin`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
