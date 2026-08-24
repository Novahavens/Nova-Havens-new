import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Messages submitted through the Nova Havens contact page.
 *
 * Rows are written by POST /api/contact (artifacts/api-server) and are the
 * durable record of every enquiry, so nothing depends on a log line surviving
 * a restart.
 */
export const contactSubmissionsTable = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ContactSubmission = typeof contactSubmissionsTable.$inferSelect;
export type InsertContactSubmission =
  typeof contactSubmissionsTable.$inferInsert;
