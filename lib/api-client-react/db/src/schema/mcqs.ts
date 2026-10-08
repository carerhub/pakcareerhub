import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const mcqsTable = pgTable("mcqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  optionD: text("option_d").notNull(),
  correctAnswer: text("correct_answer").notNull(), // A | B | C | D
  explanation: text("explanation"),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull().default("medium"), // easy | medium | hard
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMcqSchema = createInsertSchema(mcqsTable).omit({ id: true, createdAt: true });
export type InsertMcq = z.infer<typeof insertMcqSchema>;
export type Mcq = typeof mcqsTable.$inferSelect;
