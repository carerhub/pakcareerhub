import { Router, type IRouter } from "express";
import { eq, ilike, and, sql, type SQL } from "drizzle-orm";
import { db, papersTable } from "@workspace/db";
import {
  CreatePaperBody,
  UpdatePaperBody,
  ListPapersQueryParams,
  UpdatePaperParams,
  DeletePaperParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/papers", async (req, res): Promise<void> => {
  const parsed = ListPapersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { category, search, limit = 20, offset = 0 } = parsed.data;

  const conditions: SQL[] = [];
  if (category) conditions.push(eq(papersTable.category, category));
  if (search) conditions.push(ilike(papersTable.title, `%${search}%`));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(papersTable)
    .where(whereClause)
    .orderBy(sql`${papersTable.createdAt} DESC`)
    .limit(limit as number)
    .offset(offset as number);

  res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

router.post("/papers", async (req, res): Promise<void> => {
  const parsed = CreatePaperBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [paper] = await db.insert(papersTable).values(parsed.data).returning();
  res.status(201).json({ ...paper, createdAt: paper.createdAt.toISOString() });
});

router.patch("/papers/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }

  const parsed = UpdatePaperBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [updated] = await db
    .update(papersTable)
    .set(parsed.data)
    .where(eq(papersTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...updated, createdAt: updated.createdAt.toISOString() });
});

router.delete("/papers/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  await db.delete(papersTable).where(eq(papersTable.id, id));
  res.status(204).send();
});

export default router;
