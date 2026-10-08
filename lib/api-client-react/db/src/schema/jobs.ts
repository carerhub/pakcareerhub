import { pgTable, serial, text, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { departmentsTable } from "./departments";
import { citiesTable } from "./cities";
import { categoriesTable } from "./categories";

export const jobsTable = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  organization: text("organization").notNull(),
  departmentId: integer("department_id").references(() => departmentsTable.id, { onDelete: "set null" }),
  cityId: integer("city_id").references(() => citiesTable.id, { onDelete: "set null" }),
  categoryId: integer("category_id").references(() => categoriesTable.id, { onDelete: "set null" }),
  jobType: text("job_type").notNull().default("government"), // government | private
  employmentType: text("employment_type").notNull().default("full_time"), // full_time | part_time | contract
  description: text("description"),
  requirements: text("requirements"),
  howToApply: text("how_to_apply"),
  applyUrl: text("apply_url"),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  salaryPackage: text("salary_package"),
  ageMin: integer("age_min"),
  ageMax: integer("age_max"),
  vacancies: integer("vacancies"),
  postName: text("post_name"),
  bps: text("bps"),
  qualification: text("qualification"),
  education: text("education"),
  experience: text("experience"),
  gender: text("gender"),
  domicile: text("domicile"),
  quota: text("quota"),
  province: text("province"),
  location: text("location"),
  applicationFee: text("application_fee"),
  applicationStartDate: text("application_start_date"),
  requiredDocuments: text("required_documents"),
  advertisementNumber: text("advertisement_number"),
  referenceNumber: text("reference_number"),
  contactInformation: text("contact_information"),
  importantInstructions: text("important_instructions"),
  termsConditions: text("terms_conditions"),
  deadline: text("deadline"),
  isFeatured: boolean("is_featured").notNull().default(false),
  logoUrl: text("logo_url"),
  advertisementPath: text("advertisement_path"),
  advertisementName: text("advertisement_name"),
  advertisementMimeType: text("advertisement_mime_type"),
  advertisementSize: integer("advertisement_size"),
  extractedText: text("extracted_text"),
  extractionStatus: text("extraction_status").notNull().default("not_started"),
  verificationStatus: text("verification_status").notNull().default("needs_review"),
  status: text("status").notNull().default("active"), // draft | active | published | unpublished | archived
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("jobs_status_expires_at_idx").on(table.status, table.expiresAt),
]);

export const insertJobSchema = createInsertSchema(jobsTable).omit({
  id: true,
  status: true,
  expiresAt: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;
