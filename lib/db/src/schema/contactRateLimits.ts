import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Fixed-window counters used by the public contact form.
 *
 * This is separate from contact_submissions because a rejected request still
 * needs to be represented atomically when several API processes race. The
 * counter is capped at limit + 1 by the database-backed limiter, so repeated
 * rejected requests cannot make this table grow or overflow an integer.
 */
export const contactRateLimitsTable = pgTable(
  "contact_rate_limits",
  {
    key: text("key").primaryKey(),
    windowStartedAt: timestamp("window_started_at", {
      withTimezone: true,
    }).notNull(),
    count: integer("count").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    windowStartedAtIndex: index("contact_rate_limits_window_started_at_idx").on(
      table.windowStartedAt,
    ),
  }),
);

export type ContactRateLimit = typeof contactRateLimitsTable.$inferSelect;
export type InsertContactRateLimit = typeof contactRateLimitsTable.$inferInsert;
