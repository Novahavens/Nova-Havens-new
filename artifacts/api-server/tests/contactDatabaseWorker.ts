/**
 * Starts one isolated API process for contactDatabase.test.ts.
 *
 * The worker imports the real contact router, store, and database-backed
 * limiters. External notification and unrelated team routes are intentionally
 * omitted so this test has no third-party side effects.
 */

import express from "express";
import {
  createContactRouter,
  TRUSTED_PROXY_HOPS,
} from "../src/routes/contact.ts";
import {
  dbContactRateLimiter,
  dbContactStore,
  dbSenderRateLimiter,
} from "../src/lib/contactStore.ts";

const port = Number(process.env["CONTACT_TEST_PORT"]);

if (!Number.isInteger(port) || port < 1) {
  throw new Error("CONTACT_TEST_PORT must be a positive integer");
}

try {
  // Each worker performs the same startup migration as the deployed server.
  const { applyMigrations } = await import("@workspace/db/migrate");
  await applyMigrations();

  const app = express();
  app.set("trust proxy", TRUSTED_PROXY_HOPS);
  app.use(express.json());
  app.use((req, _res, next) => {
    // The contact router only logs operational metadata. This keeps the
    // worker independent from the API's production logger transport.
    (req as unknown as { log: unknown }).log = {
      info: () => undefined,
      warn: () => undefined,
      error: () => undefined,
    };
    next();
  });
  app.use(
    "/api",
    createContactRouter(dbContactStore, undefined, {
      rateLimiter: dbContactRateLimiter,
      senderRateLimiter: dbSenderRateLimiter,
    }),
  );

  const server = app.listen(port, "127.0.0.1", () => {
    process.stdout.write(`CONTACT_TEST_READY:${port}\n`);
  });

  let shuttingDown = false;
  const shutdown = () => {
    if (shuttingDown) return;
    shuttingDown = true;
    server.close(() => process.exit(0));
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
} catch (error) {
  console.error(error);
  process.exit(1);
}