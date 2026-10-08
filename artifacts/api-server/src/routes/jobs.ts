import { Router, type IRouter } from "express";
import { eq, ilike, and, type SQL, sql } from "drizzle-orm";
import {
  db,
  jobsTable,
  departmentsTable,
  citiesTable,
  categoriesTable,
} from "@workspace/db";
import {
  CreateJobBody,
  UpdateJobBody,
  ListJobsQueryParams,
  GetJobParams,
  UpdateJobParams,
  DeleteJobParams,
} from "@workspace/api-zod";
import { z } from "zod";
import { logger } from "../lib/logger";
import { extractAdvertisement } from "../lib/jobAdvertisementExtractor";
import { objectPathToUrl } from "../lib/objectStorage";

const router: IRouter = Router();

function addTwelveMonths(date: Date): Date {
  const result = new Date(date);
  const dayOfMonth = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + 12);
  const lastDayOfMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(dayOfMonth, lastDayOfMonth));
  return result;
}

function serializeJob<T extends {
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date | null;
}>(
  job: T,
) {
  return {
    ...job,
    expiresAt: (job.expiresAt ?? addTwelveMonths(job.createdAt)).toISOString(),
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    advertisementUrl: objectPathToUrl((job as { advertisementPath?: string | null }).advertisementPath ?? null),
  };
}

const jobSelection = {
  id: jobsTable.id,
  title: jobsTable.title,
  organization: jobsTable.organization,
  departmentId: jobsTable.departmentId,
  departmentName: departmentsTable.name,
  cityId: jobsTable.cityId,
  cityName: citiesTable.name,
  categoryId: jobsTable.categoryId,
  categoryName: categoriesTable.name,
  jobType: jobsTable.jobType,
  employmentType: jobsTable.employmentType,
  description: jobsTable.description,
  requirements: jobsTable.requirements,
  howToApply: jobsTable.howToApply,
  applyUrl: jobsTable.applyUrl,
  salaryMin: jobsTable.salaryMin,
  salaryMax: jobsTable.salaryMax,
  salaryPackage: jobsTable.salaryPackage,
  ageMin: jobsTable.ageMin,
  ageMax: jobsTable.ageMax,
  vacancies: jobsTable.vacancies,
  postName: jobsTable.postName,
  bps: jobsTable.bps,
  qualification: jobsTable.qualification,
  education: jobsTable.education,
  experience: jobsTable.experience,
  gender: jobsTable.gender,
  domicile: jobsTable.domicile,
  quota: jobsTable.quota,
  province: jobsTable.province,
  location: jobsTable.location,
  applicationFee: jobsTable.applicationFee,
  applicationStartDate: jobsTable.applicationStartDate,
  requiredDocuments: jobsTable.requiredDocuments,
  advertisementNumber: jobsTable.advertisementNumber,
  referenceNumber: jobsTable.referenceNumber,
  contactInformation: jobsTable.contactInformation,
  importantInstructions: jobsTable.importantInstructions,
  termsConditions: jobsTable.termsConditions,
  deadline: jobsTable.deadline,
  isFeatured: jobsTable.isFeatured,
  logoUrl: jobsTable.logoUrl,
  advertisementPath: jobsTable.advertisementPath,
  advertisementName: jobsTable.advertisementName,
  advertisementMimeType: jobsTable.advertisementMimeType,
  advertisementSize: jobsTable.advertisementSize,
  extractedText: jobsTable.extractedText,
  extractionStatus: jobsTable.extractionStatus,
  verificationStatus: jobsTable.verificationStatus,
  status: jobsTable.status,
  expiresAt: jobsTable.expiresAt,
  createdAt: jobsTable.createdAt,
  updatedAt: jobsTable.updatedAt,
};

const publicVisibility: SQL = sql`${jobsTable.status} IN ('active', 'published') AND (${jobsTable.expiresAt} IS NULL AND ${jobsTable.createdAt} + INTERVAL '12 months' > NOW() OR ${jobsTable.expiresAt} > NOW())`;

async function archiveExpiredJobs(): Promise<void> {
  const archived = await db
    .update(jobsTable)
    .set({ status: "archived" })
    .where(and(
      sql`${jobsTable.status} IN ('active', 'published')`,
      sql`COALESCE(${jobsTable.expiresAt}, ${jobsTable.createdAt} + INTERVAL '12 months') <= NOW()`,
    ))
    .returning({ id: jobsTable.id });

  if (archived.length > 0) {
    logger.info({ count: archived.length }, "Archived expired jobs");
  }
}

void archiveExpiredJobs().catch((error) => {
  logger.error({ err: error }, "Initial expired-job archive sweep failed");
});

const archiveTimer = setInterval(() => {
  void archiveExpiredJobs().catch((error) => {
    logger.error({ err: error }, "Scheduled expired-job archive sweep failed");
  });
}, 24 * 60 * 60 * 1000);
archiveTimer.unref();

router.get("/jobs", async (req, res): Promise<void> => {
  const parsed = ListJobsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { type, cityId, departmentId, categoryId, search, limit = 20, offset = 0, featured, status } = parsed.data;

  const conditions: SQL[] = [];
  if (req.session?.isAdmin) {
    if (status && status !== "all") conditions.push(eq(jobsTable.status, status));
  } else {
    conditions.push(publicVisibility);
  }
  if (type && type !== "all") conditions.push(eq(jobsTable.jobType, type));
  if (cityId) conditions.push(eq(jobsTable.cityId, cityId));
  if (departmentId) conditions.push(eq(jobsTable.departmentId, departmentId));
  if (categoryId) conditions.push(eq(jobsTable.categoryId, categoryId));
  if (featured !== undefined) conditions.push(eq(jobsTable.isFeatured, featured));
  if (search) conditions.push(ilike(jobsTable.title, `%${search}%`));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countRes] = await Promise.all([
    db
      .select(jobSelection)
      .from(jobsTable)
      .leftJoin(departmentsTable, eq(jobsTable.departmentId, departmentsTable.id))
      .leftJoin(citiesTable, eq(jobsTable.cityId, citiesTable.id))
      .leftJoin(categoriesTable, eq(jobsTable.categoryId, categoriesTable.id))
      .where(whereClause)
      .orderBy(sql`${jobsTable.createdAt} DESC`)
      .limit(limit as number)
      .offset(offset as number),
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(jobsTable)
      .where(whereClause),
  ]);

  const total = Number(countRes[0]?.count ?? 0);
  const jobs = rows.map((r) => ({
    ...serializeJob(r),
  }));

  res.json({ jobs, total });
});

router.post("/jobs", async (req, res): Promise<void> => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const createdAt = new Date();
  const [job] = await db.insert(jobsTable).values({
    ...parsed.data,
    createdAt,
    status: "active",
    expiresAt: addTwelveMonths(createdAt),
  }).returning();
  res.status(201).json({
    ...serializeJob({
      ...job,
      departmentName: null,
      cityName: null,
      categoryName: null,
    }),
  });
});

const advertisementInput = z.object({
  objectPath: z.string().startsWith("/objects/"),
  fileName: z.string().min(1).max(255),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf"]),
  size: z.number().int().positive().max(15 * 1024 * 1024),
});

function isDatabaseUnavailable(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current; depth += 1) {
    if (current instanceof Error && /endpoint has been disabled|database.*frozen|unfreeze/i.test(current.message)) {
      return true;
    }
    if (typeof current === "object" && current !== null && "cause" in current) {
      current = (current as { cause?: unknown }).cause;
    } else {
      break;
    }
  }
  return false;
}

router.post("/jobs/from-advertisement", async (req, res): Promise<void> => {
  const parsed = advertisementInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const extraction = await extractAdvertisement(
      parsed.data.objectPath,
      parsed.data.contentType,
      parsed.data.fileName,
    );
    const createdAt = new Date();
    const jobs = [];
    for (const draft of extraction.jobs) {
      const [job] = await db.insert(jobsTable).values({
        title: String(draft.title ?? "Requires Verification"),
        organization: String(draft.organization ?? "Requires Verification"),
        jobType: draft.jobType === "private" ? "private" : "government",
        employmentType: "full_time",
        postName: typeof draft.postName === "string" ? draft.postName : null,
        vacancies: typeof draft.vacancies === "number" ? draft.vacancies : null,
        bps: typeof draft.bps === "string" ? draft.bps : null,
        qualification: typeof draft.qualification === "string" ? draft.qualification : null,
        education: typeof draft.education === "string" ? draft.education : null,
        experience: typeof draft.experience === "string" ? draft.experience : null,
        ageMin: typeof draft.ageMin === "number" ? draft.ageMin : null,
        ageMax: typeof draft.ageMax === "number" ? draft.ageMax : null,
        gender: typeof draft.gender === "string" ? draft.gender : null,
        domicile: typeof draft.domicile === "string" ? draft.domicile : null,
        quota: typeof draft.quota === "string" ? draft.quota : null,
        province: typeof draft.province === "string" ? draft.province : null,
        location: typeof draft.location === "string" ? draft.location : null,
        salaryPackage: typeof draft.salaryPackage === "string" ? draft.salaryPackage : null,
        applicationFee: typeof draft.applicationFee === "string" ? draft.applicationFee : null,
        applicationStartDate: typeof draft.applicationStartDate === "string" ? draft.applicationStartDate : null,
        deadline: typeof draft.deadline === "string" ? draft.deadline : null,
        applyUrl: typeof draft.applyUrl === "string" ? draft.applyUrl : null,
        requiredDocuments: typeof draft.requiredDocuments === "string" ? draft.requiredDocuments : null,
        contactInformation: typeof draft.contactInformation === "string" ? draft.contactInformation : null,
        importantInstructions: typeof draft.importantInstructions === "string" ? draft.importantInstructions : null,
        termsConditions: typeof draft.termsConditions === "string" ? draft.termsConditions : null,
        description: typeof draft.description === "string" ? draft.description : null,
        requirements: typeof draft.requirements === "string" ? draft.requirements : null,
        howToApply: typeof draft.howToApply === "string" ? draft.howToApply : null,
        advertisementPath: parsed.data.objectPath,
        advertisementName: parsed.data.fileName,
        advertisementMimeType: parsed.data.contentType,
        advertisementSize: parsed.data.size,
        extractedText: extraction.extractedText,
        extractionStatus: extraction.extractionStatus,
        verificationStatus: "needs_review",
        status: "draft",
        createdAt,
        expiresAt: addTwelveMonths(createdAt),
      }).returning();
      jobs.push(serializeJob(job));
    }
    res.status(201).json({
      jobs,
      extractedText: extraction.extractedText,
      extractionStatus: extraction.extractionStatus,
    });
  } catch (error) {
    logger.error({ err: error }, "Job advertisement extraction failed");
    if (isDatabaseUnavailable(error)) {
      res.status(503).json({
        error: "The production database is currently paused. Unfreeze it in the Database pane, then publish the app again before creating drafts.",
      });
      return;
    }
    res.status(422).json({ error: "Advertisement could not be processed. Please verify the file and try again." });
  }
});

router.get("/jobs/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }

  const rows = await db
    .select(jobSelection)
    .from(jobsTable)
    .leftJoin(departmentsTable, eq(jobsTable.departmentId, departmentsTable.id))
    .leftJoin(citiesTable, eq(jobsTable.cityId, citiesTable.id))
    .leftJoin(categoriesTable, eq(jobsTable.categoryId, categoriesTable.id))
    .where(req.session?.isAdmin
      ? eq(jobsTable.id, id)
      : and(eq(jobsTable.id, id), publicVisibility));

  if (!rows[0]) { res.status(404).json({ error: "Not found" }); return; }

  const r = rows[0];
  res.json(serializeJob(r));
});

router.patch("/jobs/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }

  const parsed = UpdateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { expiresAt, ...jobUpdate } = parsed.data;
  if (expiresAt !== undefined && Number.isNaN(Date.parse(expiresAt))) {
    res.status(400).json({ error: "expiresAt must be a valid ISO date" });
    return;
  }
  const updateData = {
    ...jobUpdate,
    ...(expiresAt !== undefined ? { expiresAt: new Date(expiresAt) } : {}),
  };
  if (updateData.status === "active" && expiresAt === undefined) {
    updateData.expiresAt = addTwelveMonths(new Date());
  }
  const [updated] = await db
    .update(jobsTable)
    .set(updateData)
    .where(eq(jobsTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({
    ...serializeJob({
      ...updated,
      departmentName: null,
      cityName: null,
      categoryName: null,
    }),
  });
});

router.delete("/jobs/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  await db.delete(jobsTable).where(eq(jobsTable.id, id));
  res.status(204).send();
});

export default router;
