import { Router, type IRouter } from "express";
import { db, jobsTable, departmentsTable, citiesTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

const activeJobFilter = sql`status IN ('active', 'published') AND COALESCE(expires_at, created_at + INTERVAL '12 months') > NOW()`;

router.get("/stats", async (req, res): Promise<void> => {
  const [totalJobsRes, totalDepartmentsRes, totalCitiesRes, governmentJobsRes, privateJobsRes] =
    await Promise.all([
       db.execute(sql`SELECT COUNT(*) as count FROM jobs WHERE ${activeJobFilter}`),
      db.execute(sql`SELECT COUNT(*) as count FROM departments`),
      db.execute(sql`SELECT COUNT(*) as count FROM cities`),
       db.execute(sql`SELECT COUNT(*) as count FROM jobs WHERE ${activeJobFilter} AND job_type = 'government'`),
       db.execute(sql`SELECT COUNT(*) as count FROM jobs WHERE ${activeJobFilter} AND job_type = 'private'`),
    ]);

  const totalJobs = parseInt(String((totalJobsRes.rows[0] as any).count), 10);
  const totalDepartments = parseInt(String((totalDepartmentsRes.rows[0] as any).count), 10);
  const totalCities = parseInt(String((totalCitiesRes.rows[0] as any).count), 10);
  const governmentJobs = parseInt(String((governmentJobsRes.rows[0] as any).count), 10);
  const privateJobs = parseInt(String((privateJobsRes.rows[0] as any).count), 10);

  // Count distinct organizations as companies
  const totalCompaniesRes = await db.execute(sql`SELECT COUNT(DISTINCT organization) as count FROM jobs WHERE ${activeJobFilter}`);
  const totalCompanies = parseInt(String((totalCompaniesRes.rows[0] as any).count), 10);

  // Latest jobs in last 7 days
  const latestRes = await db.execute(
    sql`SELECT COUNT(*) as count FROM jobs WHERE ${activeJobFilter} AND created_at >= NOW() - INTERVAL '7 days'`,
  );
  const latestJobsCount = parseInt(String((latestRes.rows[0] as any).count), 10);

  res.json({
    totalJobs,
    totalDepartments,
    totalCities,
    totalCompanies,
    governmentJobs,
    privateJobs,
    latestJobsCount,
  });
});

export default router;
