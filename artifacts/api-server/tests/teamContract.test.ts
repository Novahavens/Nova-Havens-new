/**
 * Contract test between the Team page and the real /api/team/team.json handler.
 *
 * Run with: pnpm --filter @workspace/api-server run test:team-contract
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import express from "express";
import type { AddressInfo } from "node:net";
import {
  createTeamRouter,
  type TeamStorage,
} from "../src/routes/team.ts";
import { teamPhotoUrl } from "../../nova-havens/src/lib/teamPhoto.ts";
import { transformTeamRows } from "../../nova-havens/scripts/sync-team.js";

const TEAM_PAGE_PATH = fileURLToPath(
  new URL("../../nova-havens/src/pages/TeamPage.tsx", import.meta.url),
);
const teamPageSource = readFileSync(TEAM_PAGE_PATH, "utf8");

const MEMBER_FIELDS_READ_BY_PAGE = [
  "name",
  "role",
  "initials",
  "photo",
  "help",
  "favouritePart",
  "foods",
  "laugh",
  "spareTime",
] as const;

const storedTeamResponse = {
  members: [
    {
      name: "Dana Ellis",
      slug: "dana-ellis",
      role: "Family Advocate",
      initials: "DE",
      photo: "team/dana-ellis.jpg",
      help: "I help families settle into temporary homes.",
      favouritePart: "Helping families feel supported.",
      foods: "Tacos",
      laugh: "Bad puns",
      spareTime: "Hiking",
    },
  ],
};

const representativeSheetRow = {
  Timestamp: "2026-09-22T09:00:00.000Z",
  Name: "Dana Ellis",
  "How I help our Nova Havens clients":
    "I help families settle into temporary homes.",
  "My favorite part of working at Nova Havens is":
    "Helping families feel supported.",
  "My favorite foods are": "Tacos",
  "This is guaranteed to make me laugh": "Bad puns",
  "I like to spend my spare time doing": "Hiking",
  "Upload your favorite picture of yourself":
    "https://drive.google.com/file/d/representative-photo/view",
};

function assertMatchesTeamPageConsumer(body: unknown): void {
  assert.ok(typeof body === "object" && body !== null);
  assert.ok(
    Array.isArray((body as { members?: unknown }).members),
    'The Team page reads an array at response.members; the API response no longer provides it.',
  );

  const firstMember = (body as { members: unknown[] }).members[0];
  assert.ok(
    typeof firstMember === "object" && firstMember !== null,
    "The API response must include at least one member object.",
  );

  for (const field of MEMBER_FIELDS_READ_BY_PAGE) {
    assert.ok(
      field in firstMember,
      `The Team page reads member.${field}, but the API response does not provide it.`,
    );
  }
}

async function getFromRealRoute(storedBody: unknown): Promise<{
  status: number;
  body: unknown;
}> {
  const storage: TeamStorage = {
    async downloadAsText() {
      return { ok: true, value: JSON.stringify(storedBody) };
    },
    async downloadAsBytes() {
      return { ok: false, error: new Error("not used") };
    },
  };
  const app = express();
  app.use("/api", createTeamRouter(storage));
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const { port } = server.address() as AddressInfo;

  try {
    const response = await fetch(
      `http://127.0.0.1:${port}/api/team/team.json`,
    );
    return { status: response.status, body: await response.json() };
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

test("the contract tracks every team-member field the page reads", () => {
  assert.match(teamPageSource, /data\.members/);
  for (const field of MEMBER_FIELDS_READ_BY_PAGE) {
    assert.ok(
      teamPageSource.includes(`member.${field}`) ||
        teamPageSource.includes(`synced.${field}`) ||
        teamPageSource.includes(`'${field}'`),
      `Contract field "${field}" is no longer read by TeamPage.tsx; update the API contract test with the page.`,
    );
  }
});

test("the real handler returns the shape the Team page consumes", async () => {
  const response = await getFromRealRoute(storedTeamResponse);
  assert.equal(response.status, 200);
  assertMatchesTeamPageConsumer(response.body);
  assert.deepEqual(response.body, storedTeamResponse);
});

test("the sync producer emits the exact member shape consumed by the Team page", async () => {
  const photoCalls: unknown[][] = [];
  const payload = await transformTeamRows([representativeSheetRow], {
    generatedAt: "2026-09-22T10:00:00.000Z",
    async syncPhotoForMember(...args: unknown[]) {
      photoCalls.push(args);
      return "team/dana-ellis.jpg";
    },
  });

  assert.equal(payload.count, 1);
  assert.equal(payload.skippedBlank, 0);
  assertMatchesTeamPageConsumer(payload);
  assert.deepEqual(Object.keys(payload.members[0]).sort(), [
    "favouritePart",
    "foods",
    "help",
    "initials",
    "laugh",
    "name",
    "photo",
    "role",
    "slug",
    "spareTime",
  ]);
  assert.deepEqual(photoCalls, [
    [
      "Dana Ellis",
      "dana-ellis",
      representativeSheetRow["Upload your favorite picture of yourself"],
    ],
  ]);
});

test("a renamed sync-producer field fails the Team page contract", async () => {
  const payload = await transformTeamRows([representativeSheetRow], {
    syncPhotoForMember: async () => null,
  });
  const { favouritePart, ...renamedMember } = payload.members[0];

  assert.throws(
    () =>
      assertMatchesTeamPageConsumer({
        members: [{ ...renamedMember, favoritePart: favouritePart }],
      }),
    /member\.favouritePart/,
  );
});

test("a synced photo key reaches the real image handler with renderable bytes", async () => {
  const member = storedTeamResponse.members[0];
  assert.ok(member.photo, "The representative synced member needs a photo key.");

  const expectedBytes = Uint8Array.from([0xff, 0xd8, 0xff, 0xdb]);
  const requestedKeys: string[] = [];
  const storage: TeamStorage = {
    async downloadAsText() {
      return { ok: false, error: new Error("not used") };
    },
    async downloadAsBytes(key) {
      requestedKeys.push(key);
      return { ok: true, value: [expectedBytes, undefined] };
    },
  };
  const app = express();
  app.use("/api", createTeamRouter(storage));
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const { port } = server.address() as AddressInfo;

  try {
    const pagePhotoPath = teamPhotoUrl("/", member.photo);
    assert.equal(pagePhotoPath, "/api/team/images/dana-ellis.jpg");

    const response = await fetch(`http://127.0.0.1:${port}${pagePhotoPath}`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "image/jpeg");
    assert.deepEqual(
      new Uint8Array(await response.arrayBuffer()),
      expectedBytes,
    );
    assert.deepEqual(
      requestedKeys,
      [member.photo],
      "The page route and API prefix must resolve to the exact synced Object Storage key.",
    );
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("a renamed field fails the Team page response contract", () => {
  const { favouritePart, ...renamedMember } = storedTeamResponse.members[0];
  assert.throws(
    () =>
      assertMatchesTeamPageConsumer({
        members: [{ ...renamedMember, favoritePart: favouritePart }],
      }),
    /member\.favouritePart/,
  );
});