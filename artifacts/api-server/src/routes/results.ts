import { Router, type IRouter } from "express";
import { eq, ilike, and, sql, type SQL } from "drizzle-orm";
import { db, resultsTable } from "@workspace/db";
import {
  CreateResultBody,
  UpdateResultBody,
  ListResultsQueryParams,
  UpdateResultParams,
  DeleteResultParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/results", async (req, res): Promise<void> => {
  const parsed = ListResultsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { type, search, limit = 20, offset = 0 } = parsed.data;

  const conditions: SQL[] = [];
  if (type && type !== "all") conditions.push(eq(resultsTable.type, type));
  if (search) conditions.push(ilike(resultsTable.title, `%${search}%`));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(resultsTable)
    .where(whereClause)
    .orderBy(sql`${resultsTable.createdAt} DESC`)
    .limit(limit as number)
    .offset(offset as number);

  res.json(
    rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
  );
});

router.post("/results", async (req, res): Promise<void> => {
  const parsed = CreateResultBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [result] = await db.insert(resultsTable).values(parsed.data).returning();
  res.status(201).json({ ...result, createdAt: result.createdAt.toISOString() });
});

router.patch("/results/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }

  const parsed = UpdateResultBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [updated] = await db
    .update(resultsTable)
    .set(parsed.data)
    .where(eq(resultsTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...updated, createdAt: updated.createdAt.toISOString() });
});

router.delete("/results/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  await db.delete(resultsTable).where(eq(resultsTable.id, id));
  res.status(204).send();
});

export default router;
