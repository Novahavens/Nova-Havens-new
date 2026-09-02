/**
 * Database integration coverage for POST /api/contact.
 *
 * This test requires a provisioned development PostgreSQL database. Run it
 * with:
 *
 *   DATABASE_URL=<development database URL> \
 *     pnpm --filter @workspace/api-server run test:contact-database
 *
 * The API startup migration creates the required tables automatically. The
 * test uses unique email and sender keys, then deletes its contact submissions
 * and contact_rate_limits rows in finally so it can safely run against the
 * shared development database.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { spawn, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { RATE_LIMIT, SENDER_RATE_LIMIT } from "../src/routes/contact.ts";

const WORKER_PATH = fileURLToPath(
  new URL("./contactDatabaseWorker.ts", import.meta.url),
);

const VALID_SUBMISSION = {
  name: "Database limiter test",
  phone: "",
  subject: "General Inquiry",
  message: "A unique integration-test submission.",
};

type Worker = {
  process: ChildProcess;
  port: number;
};

type SubmissionResponse = {
  status: number;
  body: unknown;
};

let databasePool: { end(): Promise<void> } | undefined;

test.after(async () => {
  await databasePool?.end();
});

async function findFreePort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const { port } = address;
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return port;
}

async function startWorker(port: number): Promise<Worker> {
  const child = spawn(
    process.execPath,
    ["--experimental-strip-types", WORKER_PATH],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        CONTACT_TEST_PORT: String(port),
        MONDAY_API_TOKEN: "contact-database-test-token",
        NODE_ENV: "production",
        LOG_LEVEL: "silent",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  return new Promise<Worker>((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    let settled = false;

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill("SIGTERM");
      reject(
        new Error(
          `Timed out starting contact database worker on port ${port}.\n${stdout}\n${stderr}`,
        ),
      );
    }, 15_000);

    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
      if (settled || !stdout.includes(`CONTACT_TEST_READY:${port}`)) return;
      settled = true;
      clearTimeout(timeout);
      resolve({ process: child, port });
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.once("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(error);
    });
    child.once("exit", (code, signal) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(
        new Error(
          `Contact database worker exited before ready (code=${code}, signal=${signal}).\n${stdout}\n${stderr}`,
        ),
      );
    });
  });
}

async function stopWorker(worker: Worker): Promise<void> {
  if (worker.process.exitCode !== null || worker.process.signalCode !== null) {
    return;
  }

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      worker.process.kill("SIGKILL");
      resolve();
    }, 5_000);
    worker.process.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
    worker.process.kill("SIGTERM");
  });
}

async function postContact(
  worker: Worker,
  email: string,
  senderAddress: string,
): Promise<SubmissionResponse> {
  const response = await fetch(`http://127.0.0.1:${worker.port}/api/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": senderAddress,
    },
    body: JSON.stringify({ ...VALID_SUBMISSION, email }),
  });

  return {
    status: response.status,
    body: await response.json(),
  };
}

function uniqueSenderAddress(): string {
  const id = randomUUID().replaceAll("-", "");
  const octet = (offset: number) =>
    Number.parseInt(id.slice(offset, offset + 2), 16);
  return `198.18.${octet(0)}.${octet(2)}`;
}

test(
  "persists contact limits across restarts and caps concurrent requests across workers",
  {
    skip: !process.env["DATABASE_URL"]
      ? "Requires DATABASE_URL for a development PostgreSQL database"
      : false,
  },
  async () => {
    const { pool } = await import("@workspace/db");
    databasePool = pool;
    const firstWorker = await findFreePort();
    const secondWorker = await findFreePort();
    const thirdWorker = await findFreePort();
    const email = `contact-database-${randomUUID()}@example.com`;
    const senderAddress = uniqueSenderAddress();
    const senderBurstAddress = uniqueSenderAddress();
    const submittedEmails = [email];
    const rateLimitKeys = [
      `email:${senderAddress}:${email}`,
      `sender:${senderAddress}`,
      `sender:${senderBurstAddress}`,
    ];
    const workers: Worker[] = [];

    try {
      // A request in one process must consume the same bucket after that
      // process exits and another pair of processes takes over.
      const originalWorker = await startWorker(firstWorker);
      workers.push(originalWorker);
      const firstResponse = await postContact(
        originalWorker,
        email,
        senderAddress,
      );
      assert.equal(firstResponse.status, 201);
      await stopWorker(originalWorker);

      const parallelWorkers = await Promise.all([
        startWorker(secondWorker),
        startWorker(thirdWorker),
      ]);
      workers.push(...parallelWorkers);

      const remainingEmailRequests = await Promise.all(
        Array.from({ length: RATE_LIMIT.limit + 4 }, (_, index) =>
          postContact(
            parallelWorkers[index % parallelWorkers.length]!,
            email,
            senderAddress,
          ),
        ),
      );
      const emailAllowed = remainingEmailRequests.filter(
        (response) => response.status === 201,
      );
      const emailBlocked = remainingEmailRequests.filter(
        (response) => response.status === 429,
      );

      // RATE_LIMIT.limit total requests are allowed, including the one sent
      // by the process that was already shut down.
      assert.equal(emailAllowed.length, RATE_LIMIT.limit - 1);
      assert.equal(emailBlocked.length, 5);

      // Use different emails to drive the independent aggregate sender
      // limiter. All 25 requests race through two separate API processes.
      const senderBurstEmails = Array.from(
        { length: SENDER_RATE_LIMIT.limit + 5 },
        () => `contact-sender-${randomUUID()}@example.com`,
      );
      submittedEmails.push(...senderBurstEmails);
      const senderBurstResponses = await Promise.all(
        senderBurstEmails.map((senderEmail, index) =>
          postContact(
            parallelWorkers[index % parallelWorkers.length]!,
            senderEmail,
            senderBurstAddress,
          ),
        ),
      );
      const senderAllowed = senderBurstResponses.filter(
        (response) => response.status === 201,
      );
      const senderBlocked = senderBurstResponses.filter(
        (response) => response.status === 429,
      );

      // SENDER_RATE_LIMIT.limit requests are allowed per sender address,
      // regardless of how quickly they arrive or which worker receives them.
      assert.equal(senderAllowed.length, SENDER_RATE_LIMIT.limit);
      assert.equal(senderBlocked.length, 5);

      const { rows } = await pool.query<{
        key: string;
        count: number;
      }>(
        `SELECT "key", "count"
           FROM "contact_rate_limits"
          WHERE "key" = ANY($1::text[])
          ORDER BY "key"`,
        [rateLimitKeys],
      );
      const counts = new Map(rows.map((row) => [row.key, row.count]));
      assert.equal(
        counts.get(`email:${senderAddress}:${email}`),
        RATE_LIMIT.limit + 1,
      );
      assert.equal(counts.get(`sender:${senderAddress}`), RATE_LIMIT.limit);
      assert.equal(
        counts.get(`sender:${senderBurstAddress}`),
        SENDER_RATE_LIMIT.limit + 1,
      );
    } finally {
      await Promise.all(workers.map(stopWorker));
      await pool.query(
        `DELETE FROM "contact_rate_limits" WHERE "key" = ANY($1::text[])`,
        [rateLimitKeys],
      );
      await pool.query(
        `DELETE FROM "contact_submissions" WHERE "email" = ANY($1::text[])`,
        [submittedEmails],
      );
    }
  },
);

test(
  "removes expired buckets without deleting active windows",
  {
    skip: !process.env["DATABASE_URL"]
      ? "Requires DATABASE_URL for a development PostgreSQL database"
      : false,
  },
  async () => {
    const { pool } = await import("@workspace/db");
    databasePool = pool;
    const { cleanupExpiredContactRateLimits } =
      await import("../src/lib/contactStore.ts");
    const suffix = randomUUID();
    const expiredKey = `email:cleanup-expired-${suffix}`;
    const activeKey = `email:cleanup-active-${suffix}`;

    try {
      await pool.query(
        `INSERT INTO "contact_rate_limits"
          ("key", "window_started_at", "count", "updated_at")
         VALUES
          ($1, CURRENT_TIMESTAMP - ($3 * INTERVAL '1 second'), 2, CURRENT_TIMESTAMP),
          ($2, CURRENT_TIMESTAMP - ($4 * INTERVAL '1 second'), 2, CURRENT_TIMESTAMP)`,
        [
          expiredKey,
          activeKey,
          RATE_LIMIT.windowMs / 1000 + 1,
          RATE_LIMIT.windowMs / 1000 - 1,
        ],
      );

      const deleted = await cleanupExpiredContactRateLimits({
        namespace: "email",
        windowMs: RATE_LIMIT.windowMs,
      });

      assert.equal(deleted, 1);
      const { rows } = await pool.query<{ key: string }>(
        `SELECT "key"
           FROM "contact_rate_limits"
          WHERE "key" = ANY($1::text[])
          ORDER BY "key"`,
        [[expiredKey, activeKey]],
      );
      assert.deepEqual(
        rows.map((row) => row.key),
        [activeKey],
      );
    } finally {
      await pool.query(
        `DELETE FROM "contact_rate_limits" WHERE "key" = ANY($1::text[])`,
        [[expiredKey, activeKey]],
      );
    }
  },
);

test(
  "logs cleanup failures without blocking the next rate-limit check",
  {
    skip: !process.env["DATABASE_URL"]
      ? "Requires DATABASE_URL for a development PostgreSQL database"
      : false,
  },
  async () => {
    const { pool } = await import("@workspace/db");
    databasePool = pool;
    const { createDatabaseRateLimiter } =
      await import("../src/lib/contactStore.ts");
    const { logger } = await import("../src/lib/logger.ts");
    const key = `cleanup-failure-${randomUUID()}`;
    const storedKey = `email:${key}`;
    const cleanupError = new Error("cleanup database unavailable");
    const warnings: Array<{ bindings: unknown; message: string }> = [];
    const originalQuery = pool.query.bind(pool);
    const originalWarn = logger.warn;
    let queryCount = 0;

    pool.query = async (...args: any[]) => {
      if (queryCount === 0) {
        queryCount += 1;
        throw cleanupError;
      }
      queryCount += 1;
      return originalQuery(...args);
    };
    logger.warn = ((bindings: unknown, message: string) => {
      warnings.push({ bindings, message });
    }) as typeof logger.warn;

    try {
      const limiter = createDatabaseRateLimiter({
        limit: RATE_LIMIT.limit,
        windowMs: RATE_LIMIT.windowMs,
        namespace: "email",
      });

      const decision = await limiter.check(key);

      assert.deepEqual(decision, {
        allowed: true,
        remaining: RATE_LIMIT.limit - 1,
      });
      assert.deepEqual(warnings, [
        {
          bindings: {
            err: cleanupError,
            namespace: "email",
            windowMs: RATE_LIMIT.windowMs,
          },
          message: "Contact rate-limit cleanup failed",
        },
      ]);
    } finally {
      logger.warn = originalWarn;
      pool.query = originalQuery;
      await originalQuery(
        `DELETE FROM "contact_rate_limits" WHERE "key" = $1`,
        [storedKey],
      );
    }
  },
);
