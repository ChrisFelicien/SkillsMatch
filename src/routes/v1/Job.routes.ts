import { Router } from "express";
import validateSchema from "@/middlewares/validate";
import { getAllJob, createJob, deleteJob } from "@/controllers/Job.controller";
import { createJobSchema, deleteJobSchema } from "@/schemas/job.Schema";
import { protect, restrictTo } from "@/middlewares/Auth.middleware";
import { UserRoles } from "@/interfaces/IUser";

const router = Router();

router.post(
  "/",
  protect,
  restrictTo(UserRoles.ADMIN, UserRoles.CLIENT),
  validateSchema(createJobSchema),
  createJob
);
router.get("/", getAllJob);
router.delete(
  "/:jobId",
  protect,
  restrictTo(UserRoles.ADMIN, UserRoles.CLIENT),
  validateSchema(deleteJobSchema),
  deleteJob
);

export default router;
