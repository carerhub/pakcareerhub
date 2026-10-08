import { Router, type IRouter } from "express";
import healthRouter from "./health";
import statsRouter from "./stats";
import jobsRouter from "./jobs";
import departmentsRouter from "./departments";
import citiesRouter from "./cities";
import categoriesRouter from "./categories";
import resultsRouter from "./results";
import admissionsRouter from "./admissions";
import blogRouter from "./blog";
import mcqsRouter from "./mcqs";
import papersRouter from "./papers";
import settingsRouter from "./settings";
import authRouter from "./auth";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(authRouter);
// Public GET endpoints remain readable, but all content mutations require an admin session.
router.use((req, res, next) => {
  const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
  if (!isMutation || req.path.startsWith("/auth/")) {
    next();
    return;
  }
  if (req.session?.isAdmin) {
    next();
    return;
  }
  res.status(403).json({ error: "Admin access required" });
});
router.use(healthRouter);
router.use(statsRouter);
router.use(jobsRouter);
router.use(departmentsRouter);
router.use(citiesRouter);
router.use(categoriesRouter);
router.use(resultsRouter);
router.use(admissionsRouter);
router.use(blogRouter);
router.use(mcqsRouter);
router.use(papersRouter);
router.use(settingsRouter);
router.use(storageRouter);

export default router;
