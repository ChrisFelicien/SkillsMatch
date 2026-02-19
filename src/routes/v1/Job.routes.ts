import { Router } from "express";
import validateSchema from "@/middlewares/validate";
import JobController from "@/controllers/Job.controller";
import { createJobSchema, deleteJobSchema } from "@/schemas/job.Schema";
import { protect, restrictTo } from "@/middlewares/Auth.middleware";
import { UserRoles } from "@/interfaces/IUser";
import ProposalController from "@/controllers/Proposal.controller";

const router = Router();

router.post(
  "/",
  protect,
  restrictTo(UserRoles.ADMIN, UserRoles.CLIENT),
  validateSchema(createJobSchema),
  JobController.createJob
);
router.get("/", JobController.getAllJob);
router.delete(
  "/:jobId",
  protect,
  restrictTo(UserRoles.ADMIN, UserRoles.CLIENT),
  validateSchema(deleteJobSchema),
  JobController.deleteJob
);

router
  .route("/:jobId/proposals")
  .get(
    protect,
    restrictTo(UserRoles.CLIENT),
    ProposalController.getAllProposalByJob
  )
  .post(
    protect,
    restrictTo(UserRoles.FREELANCER),
    ProposalController.createProposal
  );

export default router;
