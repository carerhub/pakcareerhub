import { Router, type IRouter } from "express";
import { ilike, sql } from "drizzle-orm";
import { eq, and, type SQL } from "drizzle-orm";
import { db, admissionsTable } from "@workspace/db";
import {
  CreateAdmissionBody,
  UpdateAdmissionBody,
  ListAdmissionsQueryParams,
  UpdateAdmissionParams,
  DeleteAdmissionParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/admissions", async (req, res): Promise<void> => {
  const parsed = ListAdmissionsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { search, limit = 20, offset = 0 } = parsed.data;

  const conditions: SQL[] = [];
  if (search) conditions.push(ilike(admissionsTable.title, `%${search}%`));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(admissionsTable)
    .where(whereClause)
    .orderBy(sql`${admissionsTable.createdAt} DESC`)
    .limit(limit as number)
    .offset(offset as number);

  res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

router.post("/admissions", async (req, res): Promise<void> => {
  const parsed = CreateAdmissionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [admission] = await db.insert(admissionsTable).values(parsed.data).returning();
  res.status(201).json({ ...admission, createdAt: admission.createdAt.toISOString() });
});

router.patch("/admissions/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }

  const parsed = UpdateAdmissionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [updated] = await db
    .update(admissionsTable)
    .set(parsed.data)
    .where(eq(admissionsTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...updated, createdAt: updated.createdAt.toISOString() });
});

router.delete("/admissions/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  await db.delete(admissionsTable).where(eq(admissionsTable.id, id));
  res.status(204).send();
});

export default router;
