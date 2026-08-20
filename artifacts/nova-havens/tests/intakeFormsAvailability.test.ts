import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { INTAKE_FORMS } from "../src/lib/intakeForms.ts";
import { verifyIntakeForms } from "../scripts/check-intake-forms.ts";

function activeFormResponse(url: string, status = 200): Response {
  const formId = new URL(url).pathname.split("/").at(-1);
  return new Response(
    `<!doctype html>
      <form action="https://submit.jotform.com/submit/${formId}">
        <input type="hidden" name="formID" value="${formId}" />
      </form>`,
    {
      status,
      headers: { "content-type": "text/html; charset=utf-8" },
    },
  );
}

test("keeps the live check in release and browser validation paths", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  ) as { scripts: Record<string, string> };

  assert.match(packageJson.scripts.build, /^pnpm run validate:intake-forms &&/);
  assert.match(
    packageJson.scripts["test:smoke"],
    /^pnpm run validate:intake-forms &&/,
  );
});

test("accepts usable HTML responses for both intake forms", async () => {
  const requestedUrls: string[] = [];

  await verifyIntakeForms(async (url) => {
    requestedUrls.push(url);
    return activeFormResponse(url);
  });

  assert.deepEqual(requestedUrls, [
    INTAKE_FORMS.housing,
    INTAKE_FORMS.property,
  ]);
});

test("identifies the intake form that returns an HTTP error", async () => {
  await assert.rejects(
    verifyIntakeForms(async (url) =>
      url === INTAKE_FORMS.housing
        ? activeFormResponse(url, 404)
        : activeFormResponse(url),
    ),
    (error: Error) => {
      assert.match(error.message, /Housing application/);
      assert.match(error.message, /HTTP 404/);
      assert.doesNotMatch(error.message, /Property request/);
      return true;
    },
  );
});

test("rejects a generic HTML page that does not contain the active form", async () => {
  await assert.rejects(
    verifyIntakeForms(async (url) =>
      url === INTAKE_FORMS.property
        ? new Response("<!doctype html><title>Form unavailable</title>", {
            status: 200,
            headers: { "content-type": "text/html" },
          })
        : activeFormResponse(url),
    ),
    (error: Error) => {
      assert.match(error.message, /Property request/);
      assert.match(error.message, /did not contain an active Jotform form/);
      return true;
    },
  );
});

test("reports connection and unexpected-content failures explicitly", async () => {
  await assert.rejects(
    verifyIntakeForms(async (url) => {
      if (url === INTAKE_FORMS.housing) throw new Error("connect ECONNREFUSED");
      return new Response("not a form", {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }),
    (error: Error) => {
      assert.match(error.message, /Housing application.*connect ECONNREFUSED/s);
      assert.match(
        error.message,
        /Property request.*unexpected content type application\/json/s,
      );
      return true;
    },
  );
});
