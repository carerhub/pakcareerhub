import { Router, type IRouter } from "express";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, jobsTable } from "@workspace/db";
import {
  downloadObjectResponse,
  getObjectEntityFile,
  requestAdvertisementUpload,
} from "../lib/objectStorage";

const router: IRouter = Router();
const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf"] as const;

router.post("/storage/uploads/request-url", async (req, res): Promise<void> => {
  const parsed = z.object({
    name: z.string().min(1).max(255),
    size: z.number().int().positive().max(15 * 1024 * 1024),
    contentType: z.enum(allowedTypes),
  }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Only JPG, JPEG, PNG, WEBP, and PDF files up to 15MB are supported." });
    return;
  }
  try {
    res.json(await requestAdvertisementUpload(parsed.data.name));
  } catch (error) {
    req.log.error({ err: error }, "Advertisement upload URL failed");
    res.status(503).json({ error: "File storage is temporarily unavailable." });
  }
});

router.get("/storage/objects/{*splat}", async (req, res): Promise<void> => {
  const raw = req.params.splat;
  const objectPath = `/objects/${Array.isArray(raw) ? raw.join("/") : raw}`;
  const isAdmin = Boolean(req.session?.isAdmin);
  if (!isAdmin) {
    const [job] = await db.select({ id: jobsTable.id }).from(jobsTable).where(and(
      eq(jobsTable.advertisementPath, objectPath),
      sql`${jobsTable.status} IN ('active', 'published') AND (${jobsTable.expiresAt} IS NULL OR ${jobsTable.expiresAt} > NOW())`,
    )).limit(1);
    if (!job) {
      res.status(404).json({ error: "Advertisement not found" });
      return;
    }
  }

  try {
    const file = await getObjectEntityFile(objectPath);
    const response = await downloadObjectResponse(file);
    res.setHeader("Content-Type", response.contentType);
    res.setHeader("Cache-Control", isAdmin ? "private, max-age=300" : "public, max-age=3600");
    if (response.size) res.setHeader("Content-Length", response.size);
    response.stream.pipe(res);
  } catch (error) {
    req.log.warn({ err: error }, "Advertisement object not found");
    res.status(404).json({ error: "Advertisement not found" });
  }
});

export default router;