import { Router, type IRouter, type Request, type Response } from "express";

/**
 * Receives messages from the Nova Havens contact page:
 *
 *   POST /api/contact — throttles the sender, screens out obvious bots,
 *                       validates the submission, hands it to the store and
 *                       logs only that it arrived.
 *
 * The frontend only shows its confirmation panel once this responds 2xx, so
 * any failure here must surface as a non-2xx status rather than being
 * swallowed.
 *
 * The store is injected so this module carries no database import: routing and
 * validation stay testable without a live Postgres.
 */

// The Contact page now embeds a hosted Jotform instead of a local form, so
// this server-side check is the only validation a submission to this route
// ever receives. Kept deliberately strict since nothing upstream screens
// input before it arrives here.
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

/**
 * A tiny fixed-window rate limiter.
 *
 * A public, unauthenticated write endpoint needs a cheap way to stop a scripted
 * client from inserting rows in a loop. The default implementation below is
 * deliberately small and in-process so route tests need no database; production
 * injects the database-backed implementation from contactStore.ts. Both expose
 * the same contract, so the route does not care where counters are kept.
 */
export type RateLimitDecision =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number };

export type RateLimiter = {
  /** Records a hit for `key` and reports whether it is within the limit. */
  check(key: string): RateLimitDecision | Promise<RateLimitDecision>;
};

export type RateLimiterOptions = {
  /** Maximum number of requests allowed per key within one window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Injectable clock, so tests do not have to wait out a real window. */
  now?: () => number;
};

export function createRateLimiter({
  limit,
  windowMs,
  now = Date.now,
}: RateLimiterOptions): RateLimiter {
  const windows = new Map<string, { count: number; resetAt: number }>();

  return {
    check(key) {
      const timestamp = now();

      for (const [existingKey, window] of windows) {
        if (window.resetAt <= timestamp) {
          windows.delete(existingKey);
        }
      }

      const window = windows.get(key);

      if (!window) {
        windows.set(key, { count: 1, resetAt: timestamp + windowMs });
        return { allowed: true, remaining: limit - 1 };
      }

      if (window.count >= limit) {
        return {
          allowed: false,
          retryAfterSeconds: Math.max(
            1,
            Math.ceil((window.resetAt - timestamp) / 1000),
          ),
        };
      }

      window.count += 1;
      return { allowed: true, remaining: limit - window.count };
    },
  };
}

/**
 * A field the real form keeps hidden from people but leaves in the DOM. A
 * visitor never sees it, so anything filled in came from a script that submits
 * every input it finds. Kept in sync with the hidden input rendered by
 * artifacts/nova-havens/src/pages/ContactPage.tsx.
 */
export const CONTACT_HONEYPOT_FIELD = "company";

/**
 * Returns true when the submission carries the tell-tale signs of a bot. Only
 * signals that a person filling the form normally can never trigger belong
 * here — a false positive silently loses a real housing request.
 */
export function looksLikeSpam(body: unknown): boolean {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return false;
  }

  const honeypot = (body as Record<string, unknown>)[CONTACT_HONEYPOT_FIELD];

  return typeof honeypot === "string" && honeypot.trim() !== "";
}

/**
 * Generous enough that a visitor who resends after a validation typo is never
 * blocked, tight enough that a script cannot fill the table. This is scoped to
 * a normalized email below, so people sharing one address do not consume one
 * another's allowance.
 */
export const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 } as const;

/**
 * The per-email limit above prevents one person from repeatedly submitting.
 * Keep a separate, higher IP ceiling so a script cannot bypass that limit by
 * rotating email addresses, while still leaving room for a shared office,
 * hotel, or mobile carrier connection to submit several legitimate requests.
 */
export const SENDER_RATE_LIMIT = {
  limit: 20,
  windowMs: 10 * 60 * 1000,
} as const;

/**
 * How many proxy hops sit in front of this server: exactly one, the Replit
 * edge proxy that terminates the visitor's connection.
 *
 * Express counts X-Forwarded-For from the right, so trusting one hop resolves
 * `req.ip` to the address that trusted proxy actually observed. Anything a
 * caller injects into the header themselves ends up further left and is
 * ignored — which is what keeps a script from minting a fresh throttling
 * bucket (or burning someone else's) per request. Trusting every hop
 * (`true`) would hand that control straight to the caller.
 */
export const TRUSTED_PROXY_HOPS = 1;

/**
 * Identifies the sender for throttling. `req.ip` honours X-Forwarded-For only
 * as far as TRUSTED_PROXY_HOPS allows (configured in app.ts); the socket
 * address is the fallback so a missing header can never collapse every visitor
 * into one shared bucket key silently.
 */
function senderKey(req: Request): string {
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}

/**
 * A shared office, hotel, or mobile carrier can put many real visitors behind
 * one IP address. Email is already trimmed by validateContactSubmission; lower
 * casing here keeps the throttling key aligned with email's case-insensitive
 * semantics.
 */
function contactRateLimitKey(req: Request, email: string): string {
  return `${senderKey(req)}:${email.toLowerCase()}`;
}

function sendRateLimitedResponse(
  req: Request,
  res: Response,
  decision: Extract<RateLimitDecision, { allowed: false }>,
): void {
  req.log.warn(
    { retryAfterSeconds: decision.retryAfterSeconds },
    "Contact form submission throttled",
  );
  res.setHeader("Retry-After", String(decision.retryAfterSeconds));
  res.status(429).json({
    error:
      "Too many messages sent from this connection. Please wait a few minutes and try again, or call (629) 401-0054.",
  });
}

export type ContactRouterOptions = {
  /** Per-email limiter, overridable so tests can drive the window. */
  rateLimiter?: RateLimiter;
  /** Aggregate sender-IP limiter, overridable for focused tests. */
  senderRateLimiter?: RateLimiter;
};

export function createContactRouter(
  store: ContactStore,
  notifier?: ContactNotifier,
  options: ContactRouterOptions = {},
): IRouter {
  const router: IRouter = Router();
  const rateLimiter = options.rateLimiter ?? createRateLimiter(RATE_LIMIT);
  const senderRateLimiter =
    options.senderRateLimiter ?? createRateLimiter(SENDER_RATE_LIMIT);

  router.post("/contact", async (req, res) => {
    if (looksLikeSpam(req.body)) {
      // Nothing is stored and nothing is notified: the response deliberately
      // says no more than any other rejection so a bot learns nothing.
      req.log.warn("Contact form submission rejected as spam");
      res.status(400).json({ error: "Submission rejected" });
      return;
    }

    const result = validateContactSubmission(req.body);

    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }

    const decision = await rateLimiter.check(
      contactRateLimitKey(req, result.value.email),
    );

    if (!decision.allowed) {
      sendRateLimitedResponse(req, res, decision);
      return;
    }

    const senderDecision = await senderRateLimiter.check(senderKey(req));

    if (!senderDecision.allowed) {
      sendRateLimitedResponse(req, res, senderDecision);
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
