import { db, contactSubmissionsTable } from "@workspace/db";
import type { ContactStore } from "../routes/contact";

/** Stores contact page submissions in the contact_submissions table. */
export const dbContactStore: ContactStore = {
  async save(input) {
    const [inserted] = await db
      .insert(contactSubmissionsTable)
      .values(input)
      .returning({ id: contactSubmissionsTable.id });

    return inserted?.id;
  },
};
