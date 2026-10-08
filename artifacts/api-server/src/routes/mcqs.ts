import { Router, type IRouter } from "express";
import { eq, ilike, and, sql, type SQL } from "drizzle-orm";
import { db, mcqsTable } from "@workspace/db";
import {
  CreateMcqBody,
  UpdateMcqBody,
  ListMcqsQueryParams,
  UpdateMcqParams,
  DeleteMcqParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/mcqs", async (req, res): Promise<void> => {
  const parsed = ListMcqsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { category, difficulty, search, limit = 20, offset = 0 } = parsed.data;

  const conditions: SQL[] = [];
  if (category) conditions.push(eq(mcqsTable.category, category));
  if (difficulty) conditions.push(eq(mcqsTable.difficulty, difficulty));
  if (search) conditions.push(ilike(mcqsTable.question, `%${search}%`));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(mcqsTable)
    .where(whereClause)
    .orderBy(sql`${mcqsTable.createdAt} DESC`)
    .limit(limit as number)
    .offset(offset as number);

  res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

router.post("/mcqs", async (req, res): Promise<void> => {
  const parsed = CreateMcqBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [mcq] = await db.insert(mcqsTable).values(parsed.data).returning();
  res.status(201).json({ ...mcq, createdAt: mcq.createdAt.toISOString() });
});

router.patch("/mcqs/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }

  const parsed = UpdateMcqBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [updated] = await db
    .update(mcqsTable)
    .set(parsed.data)
    .where(eq(mcqsTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...updated, createdAt: updated.createdAt.toISOString() });
});

router.delete("/mcqs/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  await db.delete(mcqsTable).where(eq(mcqsTable.id, id));
  res.status(204).send();
});

export default router;
