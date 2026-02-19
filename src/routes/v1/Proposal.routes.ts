import { Router } from "express";
import ProposalController from "@/controllers/Proposal.controller";
import { protect, restrictTo } from "@/middlewares/Auth.middleware";
import { UserRoles } from "@/interfaces/IUser";

const router = Router();

router.patch(
  "/:id/status",
  protect,
  restrictTo(UserRoles.CLIENT),
  ProposalController.updateProposal
);

export default router;
