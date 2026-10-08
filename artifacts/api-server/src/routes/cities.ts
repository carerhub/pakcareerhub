import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, citiesTable, jobsTable } from "@workspace/db";
import {
  CreateCityBody,
  UpdateCityBody,
  UpdateCityParams,
  DeleteCityParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/cities", async (req, res): Promise<void> => {
  const rows = await db
    .select({
      id: citiesTable.id,
      name: citiesTable.name,
      slug: citiesTable.slug,
      imageUrl: citiesTable.imageUrl,
      jobCount: sql<number>`CAST(COUNT(${jobsTable.id}) AS INTEGER)`,
    })
    .from(citiesTable)
    .leftJoin(jobsTable, eq(citiesTable.id, jobsTable.cityId))
    .groupBy(citiesTable.id)
    .orderBy(citiesTable.name);
  res.json(rows);
});

router.post("/cities", async (req, res): Promise<void> => {
  const parsed = CreateCityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [city] = await db.insert(citiesTable).values(parsed.data).returning();
  res.status(201).json({ ...city, jobCount: 0 });
});

router.patch("/cities/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }

  const parsed = UpdateCityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [updated] = await db
    .update(citiesTable)
    .set(parsed.data)
    .where(eq(citiesTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...updated, jobCount: 0 });
});

router.delete("/cities/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  await db.delete(citiesTable).where(eq(citiesTable.id, id));
  res.status(204).send();
});

export default router;
