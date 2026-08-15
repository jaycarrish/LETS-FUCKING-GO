import { text, sqliteTable } from "drizzle-orm/sqlite-core";

/**
 * A single shared household board. The state is stored as one audited JSON
 * document so a completion action can atomically merge exactly one task
 * without treating a self-report as a Bob verification.
 */
export const cleanSprintBoards = sqliteTable("clean_sprint_boards", {
  id: text("id").primaryKey(),
  stateJson: text("state_json").notNull(),
  updatedAt: text("updated_at").notNull(),
});
