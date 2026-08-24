import { pool } from "./index";

/**
 * Schema migrations applied at API server startup.
 *
 * The statements are embedded here rather than kept as loose .sql files so a
 * bundled deployment (artifacts/api-server is compiled into a single file by
 * esbuild) carries its own schema and never depends on the repository layout
 * being present at runtime.
 *
 * Rules for adding one:
 *   - Append only. Never edit or reorder an entry that has shipped — applied
 *     names are recorded, so a changed entry silently never runs again.
 *   - Keep each statement idempotent where it is cheap to do so, so a partial
 *     apply can be retried safely.
 */

type Migration = { name: string; statements: string[] };

const MIGRATIONS: readonly Migration[] = [
  {
    name: "0001_contact_submissions",
    statements: [
      `CREATE TABLE IF NOT EXISTS "contact_submissions" (
        "id" serial PRIMARY KEY,
        "name" text NOT NULL,
        "email" text NOT NULL,
        "phone" text,
        "subject" text NOT NULL,
        "message" text NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      )`,
    ],
  },
];

// Arbitrary but fixed: two instances booting at once must pick the same lock.
const ADVISORY_LOCK_KEY = 4711_0001;

/**
 * Brings the database up to date. Safe to call on every boot and safe to run
 * concurrently from several instances — a Postgres advisory lock serialises
 * them and each migration is recorded once it succeeds.
 *
 * Returns the names of the migrations applied by this call (empty when the
 * database was already current). Throws if the database cannot be migrated;
 * callers should treat that as fatal rather than serving with a stale schema.
 */
export async function applyMigrations(): Promise<string[]> {
  const client = await pool.connect();
  const applied: string[] = [];

  try {
    await client.query(`SELECT pg_advisory_lock($1)`, [ADVISORY_LOCK_KEY]);
    await client.query(
      `CREATE TABLE IF NOT EXISTS "schema_migrations" (
        "name" text PRIMARY KEY,
        "applied_at" timestamp with time zone DEFAULT now() NOT NULL
      )`,
    );

    const { rows } = await client.query<{ name: string }>(
      `SELECT "name" FROM "schema_migrations"`,
    );
    const done = new Set(rows.map((row) => row.name));

    for (const migration of MIGRATIONS) {
      if (done.has(migration.name)) continue;

      await client.query("BEGIN");
      try {
        for (const statement of migration.statements) {
          await client.query(statement);
        }
        await client.query(
          `INSERT INTO "schema_migrations" ("name") VALUES ($1)`,
          [migration.name],
        );
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }

      applied.push(migration.name);
    }
  } finally {
    await client.query(`SELECT pg_advisory_unlock($1)`, [ADVISORY_LOCK_KEY]);
    client.release();
  }

  return applied;
}
