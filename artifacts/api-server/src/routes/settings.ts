import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, settingsTable } from "@workspace/db";
import { UpsertSettingsBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/settings", async (req, res): Promise<void> => {
  const rows = await db.select().from(settingsTable).orderBy(settingsTable.key);
  res.json(rows);
});

router.put("/settings", async (req, res): Promise<void> => {
  const parsed = UpsertSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const results = [];
  for (const setting of parsed.data.settings) {
    const existing = await db
      .select()
      .from(settingsTable)
      .where(eq(settingsTable.key, setting.key));

    if (existing[0]) {
      const [updated] = await db
        .update(settingsTable)
        .set({ value: setting.value, label: setting.label })
        .where(eq(settingsTable.key, setting.key))
        .returning();
      results.push(updated);
    } else {
      const [inserted] = await db
        .insert(settingsTable)
        .values(setting)
        .returning();
      results.push(inserted);
    }
  }

  res.json(results);
});

export default router;
