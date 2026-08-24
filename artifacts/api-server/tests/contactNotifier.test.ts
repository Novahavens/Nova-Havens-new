import test from "node:test";
import assert from "node:assert/strict";
import { mondayContactNotifier } from "../src/lib/contactNotifier.ts";

test("notifies every owner of the configured Monday board", async () => {
  const originalFetch = globalThis.fetch;
  const originalToken = process.env["MONDAY_API_TOKEN"];
  const originalBoardId = process.env["MONDAY_NOTIFICATION_BOARD_ID"];
  const requests: Array<{
    query: string;
    variables: Record<string, unknown>;
  }> = [];

  process.env["MONDAY_API_TOKEN"] = "test-token";
  process.env["MONDAY_NOTIFICATION_BOARD_ID"] = "12345";
  globalThis.fetch = (async (_url, init) => {
    const body = JSON.parse(String(init?.body)) as {
      query: string;
      variables: Record<string, unknown>;
    };
    requests.push(body);

    if (body.query.includes("boards(ids:")) {
      return Response.json({
        data: { boards: [{ owners: [{ id: "9" }, { id: "10" }] }] },
      });
    }

    return Response.json({
      data: { create_notification: { text: "Notification queued" } },
    });
  }) as typeof fetch;

  try {
    await mondayContactNotifier.notify(
      {
        name: "Dana Ellis",
        email: "dana@example.com",
        phone: null,
        subject: "Housing Request",
        message: "Our family was displaced last night and needs housing.",
      },
      7,
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env["MONDAY_API_TOKEN"];
    else process.env["MONDAY_API_TOKEN"] = originalToken;
    if (originalBoardId === undefined)
      delete process.env["MONDAY_NOTIFICATION_BOARD_ID"];
    else process.env["MONDAY_NOTIFICATION_BOARD_ID"] = originalBoardId;
  }

  assert.equal(requests.length, 3);
  assert.deepEqual(requests[0]?.variables, { boardId: "12345" });

  for (const request of requests.slice(1)) {
    assert.match(request.query, /target_type: Project/);
    assert.deepEqual(request.variables, {
      userId: request.variables["userId"],
      targetId: "12345",
      text: [
        "New Nova Havens contact submission #7",
        "From: Dana Ellis",
        "Email: dana@example.com",
        "Phone: Not provided",
        "Subject: Housing Request",
        "",
        "Our family was displaced last night and needs housing.",
      ].join("\n"),
    });
  }
  assert.deepEqual(
    requests.slice(1).map((request) => request.variables["userId"]),
    ["9", "10"],
  );
});

test("uses the existing board when the notification board setting is blank", async () => {
  const originalFetch = globalThis.fetch;
  const originalToken = process.env["MONDAY_API_TOKEN"];
  const originalBoardId = process.env["MONDAY_NOTIFICATION_BOARD_ID"];
  const requests: Array<{
    query: string;
    variables: Record<string, unknown>;
  }> = [];

  process.env["MONDAY_API_TOKEN"] = "test-token";
  process.env["MONDAY_NOTIFICATION_BOARD_ID"] = "   ";
  globalThis.fetch = (async (_url, init) => {
    const body = JSON.parse(String(init?.body)) as {
      query: string;
      variables: Record<string, unknown>;
    };
    requests.push(body);

    if (body.query.includes("boards(ids:")) {
      return Response.json({
        data: { boards: [{ owners: [{ id: "9" }] }] },
      });
    }

    return Response.json({
      data: { create_notification: { text: "Notification queued" } },
    });
  }) as typeof fetch;

  try {
    await mondayContactNotifier.notify(
      {
        name: "Dana Ellis",
        email: "dana@example.com",
        phone: null,
        subject: "Housing Request",
        message: "Our family was displaced last night and needs housing.",
      },
      7,
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env["MONDAY_API_TOKEN"];
    else process.env["MONDAY_API_TOKEN"] = originalToken;
    if (originalBoardId === undefined)
      delete process.env["MONDAY_NOTIFICATION_BOARD_ID"];
    else process.env["MONDAY_NOTIFICATION_BOARD_ID"] = originalBoardId;
  }

  assert.deepEqual(requests[0]?.variables, { boardId: "18415735059" });
  assert.equal(requests.length, 2);
});