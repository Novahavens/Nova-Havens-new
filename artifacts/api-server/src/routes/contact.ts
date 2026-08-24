import { Router, type IRouter } from "express";

/**
 * Receives messages from the Nova Havens contact page:
 *
 *   POST /api/contact — validates the submission, hands it to the store and
 *                       logs only that it arrived.
 *
 * The frontend only shows its confirmation panel once this responds 2xx, so
 * any failure here must surface as a non-2xx status rather than being
 * swallowed.
 *
 * The store is injected so this module carries no database import: routing and
 * validation stay testable without a live Postgres.
 */

// Mirrors artifacts/nova-havens/src/lib/contactFormValidation.ts so the
// browser and the server agree on what a valid submission looks like. The
// server is the authority: the client check can be bypassed entirely.
const EMAIL_PATTERN =
  /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i;

/**
 * The exact options offered by the contact form's subject picker. A closed set
 * means the only user-supplied value this route ever handles outside the
 * database is one of these constants.
 */
export const CONTACT_SUBJECTS = [
  "General Inquiry",
  "Housing Request",
  "Property Submission",
  "Partnership",
  "Press",
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

// Upper bounds so a single request cannot write an unbounded row.
const MAX_LENGTHS = {
  name: 200,
  email: 320,
  phone: 50,
  message: 5000,
} as const;

export type ContactSubmissionInput = {
  name: string;
  email: string;
  phone: string | null;
  subject: ContactSubject;
  message: string;
};

export type ContactStore = {
  /** Persists the submission and returns its identifier. */
  save(input: ContactSubmissionInput): Promise<number | undefined>;
};

export type ContactNotifier = {
  /** Delivers an operational alert after a submission has been stored. */
  notify(
    input: ContactSubmissionInput,
    submissionId: number | undefined,
  ): Promise<void>;
};

export type ContactValidationResult =
  | { ok: true; value: ContactSubmissionInput }
  | { ok: false; error: string };

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateContactSubmission(
  body: unknown,
): ContactValidationResult {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "Request body must be a JSON object" };
  }

  const raw = body as Record<string, unknown>;
  const name = asTrimmedString(raw["name"]);
  const email = asTrimmedString(raw["email"]);
  const phone = asTrimmedString(raw["phone"]);
  const subject = asTrimmedString(raw["subject"]);
  const message = asTrimmedString(raw["message"]);

  if (name.length < 2) {
    return { ok: false, error: "Name must be at least 2 characters" };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Please enter a valid email address" };
  }
  if (!(CONTACT_SUBJECTS as readonly string[]).includes(subject)) {
    return { ok: false, error: "Please select a subject" };
  }
  if (message.length < 10) {
    return { ok: false, error: "Message must be at least 10 characters" };
  }

  const lengths = { name, email, phone, message };
  for (const [field, limit] of Object.entries(MAX_LENGTHS)) {
    if (lengths[field as keyof typeof lengths].length > limit) {
      return { ok: false, error: `${field} is too long (max ${limit})` };
    }
  }

  return {
    ok: true,
    value: {
      name,
      email,
      phone: phone === "" ? null : phone,
      subject: subject as ContactSubject,
      message,
    },
  };
}

export function createContactRouter(
  store: ContactStore,
  notifier?: ContactNotifier,
): IRouter {
  const router: IRouter = Router();

  router.post("/contact", async (req, res) => {
    const result = validateContactSubmission(req.body);

    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }

    try {
      const id = await store.save(result.value);

      // Identifier only — nothing the submitter typed reaches the log stream.
      req.log.info({ submissionId: id }, "Contact form submission stored");

      if (notifier) {
        try {
          await notifier.notify(result.value, id);
          req.log.info(
            { submissionId: id },
            "Contact form notification delivered",
          );
        } catch (err) {
          // The database row is the source of truth. A transient notification
          // outage must never make a successful visitor submission look lost.
          req.log.error(
            { err, submissionId: id },
            "Contact form notification failed",
          );
        }
      }

      res.status(201).json({ id });
    } catch (err) {
      req.log.error({ err }, "Failed to store contact form submission");
      res.status(500).json({ error: "Could not store submission" });
    }
  });

  return router;
}
