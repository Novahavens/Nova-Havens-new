import { applyMigrations } from "@workspace/db/migrate";
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// The schema is brought up to date before the first request is served, so a
// freshly deployed environment can store contact form submissions immediately
// instead of failing every insert until someone runs a migration by hand.
try {
  const applied = await applyMigrations();
  if (applied.length > 0) {
    logger.info({ applied }, "Applied database migrations");
  }
} catch (err) {
  logger.error({ err }, "Database migration failed — refusing to start");
  process.exit(1);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
