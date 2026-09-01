import { db, pool, contactSubmissionsTable } from "@workspace/db";
import {
  RATE_LIMIT,
  SENDER_RATE_LIMIT,
  type ContactStore,
  type RateLimiter,
  type RateLimiterOptions,
} from "../routes/contact.ts";

/** Stores contact page submissions in the contact_submissions table. */
export const dbContactStore: ContactStore = {
  async save(input) {
    const [inserted] = await db
      .insert(contactSubmissionsTable)
      .values(input)
      .returning({ id: contactSubmissionsTable.id });

    return inserted?.id;
  },
};

type DatabaseRateLimiterOptions = Pick<
  RateLimiterOptions,
  "limit" | "windowMs"
> & {
  namespace: "email" | "sender";
};

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

function getWindowSeconds(windowMs: number): number {
  if (!Number.isInteger(windowMs) || windowMs < 1000) {
    throw new Error("Rate-limit window must be at least one second");
  }

  const windowSeconds = windowMs / 1000;
  if (!Number.isInteger(windowSeconds)) {
    throw new Error("Rate-limit window must be a whole number of seconds");
  }

  return windowSeconds;
}

/**
 * Deletes buckets whose fixed window has ended.
 *
 * The namespace predicate is important because different limiter namespaces
 * may use different window lengths. The database clock keeps this decision
 * consistent across API workers, and PostgreSQL's row locking makes a
 * concurrent cleanup safe with the limiter upsert.
 */
export async function cleanupExpiredContactRateLimits({
  namespace,
  windowMs,
}: Pick<
  DatabaseRateLimiterOptions,
  "namespace" | "windowMs"
>): Promise<number> {
  const windowSeconds = getWindowSeconds(windowMs);
  const { rowCount } = await pool.query(
    `DELETE FROM "contact_rate_limits"
      WHERE "key" LIKE $1
        AND "window_started_at" +
            ($2 * INTERVAL '1 second') <= CURRENT_TIMESTAMP`,
    [`${namespace}:%`, windowSeconds],
  );

  return rowCount ?? 0;
}

/**
 * Creates an atomic, Postgres-backed fixed-window limiter.
 *
 * The upsert is the synchronization point shared by every API process. It
 * uses the database clock to put all instances in the same window, and caps
 * the counter at limit + 1 so a blocked script cannot inflate a row forever.
 */
export function createDatabaseRateLimiter({
  limit,
  windowMs,
  namespace,
}: DatabaseRateLimiterOptions): RateLimiter {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("Rate limit must be a positive integer");
  }
  const windowSeconds = getWindowSeconds(windowMs);
  let cleanupDueAt = 0;
  let cleanupInFlight: Promise<void> | undefined;

  async function runCleanupIfDue(): Promise<void> {
    const now = Date.now();
    if (now < cleanupDueAt) {
      return;
    }

    if (!cleanupInFlight) {
      cleanupDueAt = now + CLEANUP_INTERVAL_MS;
      cleanupInFlight = cleanupExpiredContactRateLimits({
        namespace,
        windowMs,
      })
        .then(() => undefined)
        .catch(() => undefined)
        .finally(() => {
          cleanupInFlight = undefined;
        });
    }

    await cleanupInFlight;
  }

  return {
    async check(key) {
      await runCleanupIfDue();
      const bucketKey = `${namespace}:${key}`;
      const { rows } = await pool.query<{
        count: number;
        window_started_at: Date;
        retry_after_seconds: number;
      }>(
        `WITH current_window AS (
           SELECT to_timestamp(
             floor(extract(epoch FROM CURRENT_TIMESTAMP) / $2) * $2
           ) AS started_at
         ),
         updated AS (
           INSERT INTO "contact_rate_limits"
             ("key", "window_started_at", "count", "updated_at")
           SELECT $1, started_at, 1, CURRENT_TIMESTAMP
           FROM current_window
           ON CONFLICT ("key") DO UPDATE
           SET
             "window_started_at" = CASE
               WHEN "contact_rate_limits"."window_started_at" <
                    EXCLUDED."window_started_at"
                 THEN EXCLUDED."window_started_at"
               ELSE "contact_rate_limits"."window_started_at"
             END,
             "count" = CASE
               WHEN "contact_rate_limits"."window_started_at" <
                    EXCLUDED."window_started_at"
                 THEN 1
               ELSE LEAST("contact_rate_limits"."count" + 1, $3)
             END,
             "updated_at" = CURRENT_TIMESTAMP
           RETURNING "count", "window_started_at"
         )
         SELECT
           "count",
           "window_started_at",
           GREATEST(
             1,
             CEIL(
               EXTRACT(
                 EPOCH FROM (
                   "window_started_at" +
                   ($2 * INTERVAL '1 second') - CURRENT_TIMESTAMP
                 )
               )
             )
           )::integer AS retry_after_seconds
         FROM updated`,
        [bucketKey, windowSeconds, limit + 1],
      );

      const row = rows[0];
      if (!row) {
        throw new Error("Rate limiter did not return a counter row");
      }

      if (row.count > limit) {
        return {
          allowed: false,
          retryAfterSeconds: row.retry_after_seconds,
        };
      }

      return { allowed: true, remaining: limit - row.count };
    },
  };
}

/** Durable production limiters shared by all API processes. */
export const dbContactRateLimiter = createDatabaseRateLimiter({
  ...RATE_LIMIT,
  namespace: "email",
});

export const dbSenderRateLimiter = createDatabaseRateLimiter({
  ...SENDER_RATE_LIMIT,
  namespace: "sender",
});
