/**
 * Contract test between the Contact page and the real /api/contact handler.
 *
 * The Playwright smoke test stubs /api/contact, so it proves the page behaves
 * but never proves the API accepts what the page sends. This test closes that
 * gap: it builds the payload from the frontend's own sources — the form value
 * shape, the subject picker options and the honeypot field name read straight
 * out of ContactPage.tsx — and posts it at the real router. A rename on either
 * side fails here instead of in production.
 *
 * Run with: pnpm --filter @workspace/api-server run test:contact-contract
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import express from "express";
import type { AddressInfo } from "node:net";
import {
  createContactRouter,
  CONTACT_HONEYPOT_FIELD,
  CONTACT_SUBJECTS,
  TRUSTED_PROXY_HOPS,
  type ContactStore,
  type ContactSubmissionInput,
} from "../src/routes/contact.ts";
// Imported, not copied: if the page's form value shape is renamed, the payload
// this test sends changes with it and the assertions below catch the drift.
import { CONTACT_FORM_DEFAULT_VALUES } from "../../nova-havens/src/lib/contactFormValidation.ts";

const CONTACT_PAGE_PATH = fileURLToPath(
  new URL("../../nova-havens/src/pages/ContactPage.tsx", import.meta.url),
);
const contactPageSource = readFileSync(CONTACT_PAGE_PATH, "utf8");

/** The values the page's fetch body carries beyond the form fields. */
function extraPayloadKeysSentByPage(): string[] {
  const body = contactPageSource.match(/JSON\.stringify\(\{([^}]*)\}\)/);
  assert.ok(
    body,
    "Could not find the JSON.stringify(...) request body in ContactPage.tsx — has the submit handler changed shape?",
  );

  return [...body[1].matchAll(/(?:^|,)\s*([A-Za-z0-9_]+)\s*:/g)].map(
    (match) => match[1],
  );
}

/** The subject values the page's picker can actually produce. */
function subjectOptionsOfferedByPage(): string[] {
  const select = contactPageSource.match(
    /data-testid="select-subject"[\s\S]*?<\/(?:NativeSelect|select)>/,
  );
  assert.ok(
    select,
    'Could not find the subject picker in ContactPage.tsx — has data-testid="select-subject" moved?',
  );

  return [...select[0].matchAll(/<option value="([^"]*)"/g)]
    .map((match) => match[1])
    .filter((value) => value !== "");
}

/**
 * The exact object the Contact page posts: every field of the form's value
 * shape plus the hidden honeypot, which a real visitor always submits empty.
 */
function payloadAsSentByPage(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  const filled: Record<string, string> = {
    name: "Dana Ellis",
    email: "dana@example.com",
    phone: "(555) 123-4567",
    subject: subjectOptionsOfferedByPage()[1] ?? "Housing Request",
    message: "Our family was displaced last night and needs housing.",
  };

  const payload: Record<string, unknown> = {};
  for (const field of Object.keys(CONTACT_FORM_DEFAULT_VALUES)) {
    assert.ok(
      field in filled,
      `The Contact form gained a "${field}" field with no value in this contract test — add one and confirm the API accepts it.`,
    );
    payload[field] = filled[field];
  }

  for (const key of extraPayloadKeysSentByPage()) {
    payload[key] = "";
  }

  return { ...payload, ...overrides };
}

function recordingStore(): ContactStore & { saved: ContactSubmissionInput[] } {
  const saved: ContactSubmissionInput[] = [];
  return {
    saved,
    async save(input) {
      saved.push(input);
      return saved.length;
    },
  };
}

async function withRealRoute(
  run: (
    post: (
      body: unknown,
    ) => Promise<{ status: number; body: unknown }>,
    store: ContactStore & { saved: ContactSubmissionInput[] },
  ) => Promise<void>,
): Promise<void> {
  const store = recordingStore();
  const app = express();
  app.set("trust proxy", TRUSTED_PROXY_HOPS);
  app.use(express.json());
  app.use((req, _res, next) => {
    (req as unknown as { log: unknown }).log = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };
    next();
  });
  app.use("/api", createContactRouter(store));

  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address() as AddressInfo;

  try {
    await run(async (body) => {
      const response = await fetch(`http://127.0.0.1:${port}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return { status: response.status, body: await response.json() };
    }, store);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("the page sends the honeypot field the API screens on", () => {
  assert.deepEqual(extraPayloadKeysSentByPage(), [CONTACT_HONEYPOT_FIELD]);
});

test("every subject the picker offers is one the API accepts", () => {
  assert.deepEqual(
    subjectOptionsOfferedByPage(),
    [...CONTACT_SUBJECTS],
    "The Contact page's subject options drifted from CONTACT_SUBJECTS — the API rejects anything outside its list.",
  );
});

test("the real handler accepts the payload the Contact page sends", async () => {
  await withRealRoute(async (post, store) => {
    const payload = payloadAsSentByPage();
    const { status, body } = await post(payload);

    assert.equal(status, 201, `The API rejected a genuine submission: ${JSON.stringify(body)}`);
    assert.deepEqual(body, { id: 1 });
    assert.deepEqual(store.saved, [
      {
        name: payload["name"],
        email: payload["email"],
        phone: payload["phone"],
        subject: payload["subject"],
        message: payload["message"],
      },
    ]);
  });
});

test("the real handler accepts the payload when the optional phone is blank", async () => {
  await withRealRoute(async (post, store) => {
    const { status } = await post(payloadAsSentByPage({ phone: "" }));

    assert.equal(status, 201);
    assert.equal(store.saved[0]?.phone, null);
  });
});

const REJECTED_PAYLOADS: ReadonlyArray<[string, Record<string, unknown>]> = [
  [
    "a renamed name field",
    (() => {
      const { name, ...rest } = payloadAsSentByPage();
      return { ...rest, fullName: name };
    })(),
  ],
  [
    "a renamed message field",
    (() => {
      const { message, ...rest } = payloadAsSentByPage();
      return { ...rest, body: message };
    })(),
  ],
  ["a missing email", payloadAsSentByPage({ email: undefined })],
  ["a malformed email", payloadAsSentByPage({ email: "dana@" })],
  ["a subject outside the picker", payloadAsSentByPage({ subject: "Anything" })],
  ["a message below the minimum length", payloadAsSentByPage({ message: "hi" })],
];

for (const [label, payload] of REJECTED_PAYLOADS) {
  test(`the real handler rejects ${label}`, async () => {
    await withRealRoute(async (post, store) => {
      const { status, body } = await post(payload);

      assert.equal(status, 400, `Expected a rejection, got ${status}`);
      assert.ok(typeof (body as { error?: unknown }).error === "string");
      assert.deepEqual(store.saved, []);
    });
  });
}
