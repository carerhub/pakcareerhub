import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, departmentsTable, jobsTable } from "@workspace/db";
import {
  CreateDepartmentBody,
  UpdateDepartmentBody,
  UpdateDepartmentParams,
  DeleteDepartmentParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/departments", async (req, res): Promise<void> => {
  const rows = await db
    .select({
      id: departmentsTable.id,
      name: departmentsTable.name,
      slug: departmentsTable.slug,
      iconUrl: departmentsTable.iconUrl,
      jobCount: sql<number>`CAST(COUNT(${jobsTable.id}) AS INTEGER)`,
    })
    .from(departmentsTable)
    .leftJoin(jobsTable, eq(departmentsTable.id, jobsTable.departmentId))
    .groupBy(departmentsTable.id)
    .orderBy(departmentsTable.name);
  res.json(rows);
});

router.post("/departments", async (req, res): Promise<void> => {
  const parsed = CreateDepartmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [dept] = await db.insert(departmentsTable).values(parsed.data).returning();
  res.status(201).json({ ...dept, jobCount: 0 });
});

router.patch("/departments/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }

  const parsed = UpdateDepartmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [updated] = await db
    .update(departmentsTable)
    .set(parsed.data)
    .where(eq(departmentsTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...updated, jobCount: 0 });
});

router.delete("/departments/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  await db.delete(departmentsTable).where(eq(departmentsTable.id, id));
  res.status(204).send();
});

export default router;
