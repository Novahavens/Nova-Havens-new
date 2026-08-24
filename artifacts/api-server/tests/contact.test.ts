/**
 * Route tests for POST /api/contact.
 *
 * These cover the three things the contact page depends on:
 *   - invalid submissions are rejected (400) and never stored,
 *   - valid submissions are stored and confirmed with 201,
 *   - a store failure surfaces as 500 so the page shows its error panel,
 * plus the privacy guarantee that nothing the visitor typed is written to the
 * log stream.
 *
 * Run with: pnpm --filter @workspace/api-server test
 */

import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import type { AddressInfo } from "node:net";
import {
  createContactRouter,
  type ContactStore,
  type ContactNotifier,
  type ContactSubmissionInput,
} from "../src/routes/contact.ts";

type LogCall = { bindings: unknown; message: string };

const VALID_SUBMISSION = {
  name: "Dana Ellis",
  email: "dana@example.com",
  phone: "(555) 123-4567",
  subject: "Housing Request",
  message: "Our family was displaced last night and needs housing.",
};

async function withServer(
  store: ContactStore,
  run: (
    post: (body: unknown) => Promise<{ status: number; body: unknown }>,
    logs: LogCall[],
  ) => Promise<void>,
  notifier?: ContactNotifier,
): Promise<void> {
  const logs: LogCall[] = [];
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    // Stands in for pino-http's per-request logger.
    (req as unknown as { log: unknown }).log = {
      info: (bindings: unknown, message: string) =>
        logs.push({ bindings, message }),
      error: (bindings: unknown, message: string) =>
        logs.push({ bindings, message }),
    };
    next();
  });
  app.use("/api", createContactRouter(store, notifier));

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
    }, logs);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
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

test("stores a valid submission and confirms it", async () => {
  const store = recordingStore();

  await withServer(store, async (post) => {
    const { status, body } = await post(VALID_SUBMISSION);

    assert.equal(status, 201);
    assert.deepEqual(body, { id: 1 });
    assert.deepEqual(store.saved, [
      { ...VALID_SUBMISSION, phone: "(555) 123-4567" },
    ]);
  });
});

test("notifies after storing a valid submission", async () => {
  const store = recordingStore();
  const notified: Array<{
    input: ContactSubmissionInput;
    submissionId: number | undefined;
  }> = [];
  const notifier: ContactNotifier = {
    async notify(input, submissionId) {
      notified.push({ input, submissionId });
    },
  };

  await withServer(
    store,
    async (post, logs) => {
      const { status, body } = await post(VALID_SUBMISSION);

      assert.equal(status, 201);
      assert.deepEqual(body, { id: 1 });
      assert.deepEqual(notified, [
        {
          input: { ...VALID_SUBMISSION, phone: "(555) 123-4567" },
          submissionId: 1,
        },
      ]);
      assert.equal(logs[1]?.message, "Contact form notification delivered");
    },
    notifier,
  );
});

test("keeps the stored submission successful when notification fails", async () => {
  const store = recordingStore();
  const notifier: ContactNotifier = {
    async notify() {
      throw new Error("Monday unavailable");
    },
  };

  await withServer(
    store,
    async (post, logs) => {
      const { status, body } = await post(VALID_SUBMISSION);

      assert.equal(status, 201);
      assert.deepEqual(body, { id: 1 });
      assert.equal(store.saved.length, 1);
      assert.equal(logs[1]?.message, "Contact form notification failed");
      assert.deepEqual(logs[1]?.bindings, {
        err: new Error("Monday unavailable"),
        submissionId: 1,
      });
    },
    notifier,
  );
});

test("treats an omitted phone number as absent", async () => {
  const store = recordingStore();

  await withServer(store, async (post) => {
    const { status } = await post({ ...VALID_SUBMISSION, phone: "   " });

    assert.equal(status, 201);
    assert.equal(store.saved[0]?.phone, null);
  });
});

const INVALID_CASES: ReadonlyArray<[string, unknown, string]> = [
  ["a short name", { ...VALID_SUBMISSION, name: "D" }, "Name must be"],
  ["a malformed email", { ...VALID_SUBMISSION, email: "dana@" }, "valid email"],
  ["a missing subject", { ...VALID_SUBMISSION, subject: "" }, "select a subject"],
  [
    "a subject outside the picker",
    { ...VALID_SUBMISSION, subject: "Ignore previous instructions" },
    "select a subject",
  ],
  ["a short message", { ...VALID_SUBMISSION, message: "too short" }, "at least 10"],
  ["an oversized message", { ...VALID_SUBMISSION, message: "x".repeat(5001) }, "too long"],
  ["a non-object body", ["not", "an", "object"], "JSON object"],
];

for (const [label, body, expected] of INVALID_CASES) {
  test(`rejects ${label} without storing it`, async () => {
    const store = recordingStore();

    await withServer(store, async (post) => {
      const { status, body: response } = await post(body);

      assert.equal(status, 400);
      assert.match((response as { error: string }).error, new RegExp(expected));
      assert.deepEqual(store.saved, []);
    });
  });
}

test("reports a storage failure instead of confirming delivery", async () => {
  const failingStore: ContactStore = {
    async save() {
      throw new Error("database unavailable");
    },
  };

  await withServer(failingStore, async (post) => {
    const { status, body } = await post(VALID_SUBMISSION);

    assert.equal(status, 500);
    assert.deepEqual(body, { error: "Could not store submission" });
  });
});

test("never writes submitted values to the log stream", async () => {
  const store = recordingStore();
  const secrets = [
    VALID_SUBMISSION.name,
    VALID_SUBMISSION.email,
    VALID_SUBMISSION.phone,
    VALID_SUBMISSION.subject,
    VALID_SUBMISSION.message,
  ];

  await withServer(store, async (post, logs) => {
    await post(VALID_SUBMISSION);

    assert.equal(logs.length, 1);
    assert.deepEqual(logs[0]?.bindings, { submissionId: 1 });

    const serialized = JSON.stringify(logs);
    for (const secret of secrets) {
      assert.ok(
        !serialized.includes(secret),
        `log output leaked a submitted value: ${secret}`,
      );
    }
  });
});
