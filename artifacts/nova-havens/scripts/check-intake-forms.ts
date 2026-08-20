import { INTAKE_FORMS } from "../src/lib/intakeForms.ts";

const REQUEST_TIMEOUT_MS = 15_000;

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

type IntakeForm = {
  id: string;
  name: string;
  url: string;
};

const intakeForms: IntakeForm[] = [
  {
    id: new URL(INTAKE_FORMS.housing).pathname.split("/").at(-1) ?? "",
    name: "Housing application",
    url: INTAKE_FORMS.housing,
  },
  {
    id: new URL(INTAKE_FORMS.property).pathname.split("/").at(-1) ?? "",
    name: "Property request",
    url: INTAKE_FORMS.property,
  },
];

function failureFor(form: IntakeForm, reason: string): string {
  return `- ${form.name} (${form.url}) is unavailable: ${reason}`;
}

async function checkIntakeForm(
  form: IntakeForm,
  fetchImpl: FetchLike,
): Promise<string | undefined> {
  try {
    const response = await fetchImpl(form.url, {
      redirect: "follow",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      return failureFor(form, `received HTTP ${response.status}`);
    }

    const contentType =
      response.headers.get("content-type")?.toLowerCase() ?? "";
    if (!contentType.includes("text/html")) {
      return failureFor(
        form,
        `received unexpected content type ${contentType || "none"}`,
      );
    }

    const body = await response.text();
    const submitAction = `action="https://submit.jotform.com/submit/${form.id}"`;
    const formIdInput = `name="formID" value="${form.id}"`;
    if (!body.includes(submitAction) || !body.includes(formIdInput)) {
      return failureFor(
        form,
        "response did not contain an active Jotform form",
      );
    }
  } catch (error) {
    const reason =
      error instanceof Error
        ? error.message
        : "an unknown network error occurred";
    return failureFor(form, `request failed (${reason})`);
  }
}

export async function verifyIntakeForms(
  fetchImpl: FetchLike = fetch,
): Promise<void> {
  const failures = (
    await Promise.all(
      intakeForms.map((form) => checkIntakeForm(form, fetchImpl)),
    )
  ).filter((failure): failure is string => failure !== undefined);

  if (failures.length > 0) {
    throw new Error(
      `Intake form availability check failed:\n${failures.join("\n")}`,
    );
  }
}

if (import.meta.main) {
  verifyIntakeForms().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
