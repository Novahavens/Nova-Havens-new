import type { ContactSubmissionInput, ContactNotifier } from "../routes/contact";

const MONDAY_API_URL = "https://api.monday.com/v2";
const DEFAULT_NOTIFICATION_BOARD_ID = "18415735059";

type MondayResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type BoardOwnersResponse = {
  boards: Array<{ owners: Array<{ id: string }> }>;
};

type CreateNotificationResponse = {
  create_notification: { text: string };
};

async function mondayRequest<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const token = process.env["MONDAY_API_TOKEN"];
  if (!token) {
    throw new Error("MONDAY_API_TOKEN is not available in the environment.");
  }

  const response = await fetch(MONDAY_API_URL, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Monday.com API returned HTTP ${response.status}.`);
  }

  const payload = (await response.json()) as MondayResponse<T>;
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("; "));
  }
  if (!payload.data) {
    throw new Error("Monday.com API returned no data.");
  }

  return payload.data;
}

function notificationText(
  input: ContactSubmissionInput,
  submissionId: number | undefined,
): string {
  const phone = input.phone ?? "Not provided";
  const identifier =
    submissionId === undefined ? "without a database id" : `#${submissionId}`;

  return [
    `New Nova Havens contact submission ${identifier}`,
    `From: ${input.name}`,
    `Email: ${input.email}`,
    `Phone: ${phone}`,
    `Subject: ${input.subject}`,
    "",
    input.message,
  ].join("\n");
}

/**
 * Sends a Monday notification to each owner of the configured team board.
 *
 * MONDAY_NOTIFICATION_BOARD_ID can point at a dedicated contact/inbox board.
 * It defaults to the existing Nova Havens property board, which means the
 * current team gets alerted without requiring another workspace setting.
 */
export const mondayContactNotifier: ContactNotifier = {
  async notify(input, submissionId) {
    const boardId =
      process.env["MONDAY_NOTIFICATION_BOARD_ID"] ??
      DEFAULT_NOTIFICATION_BOARD_ID;
    const owners = await mondayRequest<BoardOwnersResponse>(
      `query ($boardId: ID!) {
        boards(ids: [$boardId]) {
          owners { id }
        }
      }`,
      { boardId },
    );

    const ownerIds = owners.boards[0]?.owners.map((owner) => owner.id) ?? [];
    if (ownerIds.length === 0) {
      throw new Error(`Monday board ${boardId} has no owners to notify.`);
    }

    const text = notificationText(input, submissionId);
    await Promise.all(
      ownerIds.map((userId) =>
        mondayRequest<CreateNotificationResponse>(
          `mutation ($userId: ID!, $targetId: ID!, $text: String!) {
            create_notification(
              user_id: $userId,
              target_id: $targetId,
              text: $text,
              target_type: Project
            ) { text }
          }`,
          { userId, targetId: boardId, text },
        ),
      ),
    );
  },
};