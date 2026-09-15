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