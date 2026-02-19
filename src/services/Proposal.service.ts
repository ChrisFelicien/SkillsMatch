import { IProposal, ProposalStatus } from "@/interfaces/IProposal";
import { UserRoles } from "@/interfaces/IUser";
import Job from "@/models/Job.model";
import Proposal from "@/models/Proposal.model";
import User from "@/models/User.model";
import AppError from "@/utils/AppError";
import logger from "@/utils/logger";
import { Types } from "mongoose";

class ProposalService {
  async createProposal(
    jobId: Types.ObjectId,
    freelancerId: Types.ObjectId,
    coverLetter: string,
    bidAmount: number
  ) {
    // client can not apply to his own job

    const job = await Job.findById(jobId);

    if (!job) {
      throw new AppError("Job not found", 404);
    }

    if (job.clientId.toString() === freelancerId.toString()) {
      throw new AppError("You can not apply to your own job", 400);
    }

    const freelancer = await User.findById(freelancerId).select("role");

    if (!freelancer || freelancer.role !== UserRoles.FREELANCER) {
      throw new AppError("Only freelancer can apply to job", 403);
    }

    const proposal = await Proposal.create({
      job: jobId,
      freelancer: freelancerId,
      coverLetter,
      bidAmount
    });

    await Job.findByIdAndUpdate(jobId, { $inc: { proposalsCount: 1 } });

    logger.info("New proposal created", { id: proposal._id });
    return {
      proposal
    };
  }

  async getAllProposalsByJob(jobId: Types.ObjectId, ownerId: Types.ObjectId) {
    //  get the job form jobId
    const job = await Job.findById(jobId).select("clientId");

    // Check if the job exist

    if (!job) {
      logger.error(`User tried to access the job does not exist`);
      throw new AppError("No job found with this id.", 404);
    }

    // check if the current user is not the job owner

    if (job.clientId.toString() !== ownerId.toString()) {
      logger.error("User tried to access proposals without permission ");
      throw new AppError("Forbidden: Access denied", 403);
    }

    // get all proposals form the jobs

    const [proposals, totals] = await Promise.all([
      Proposal.find({ job: jobId })
        .populate("freelancer", "name email avatar")
        .sort("-createdAt"),
      Proposal.countDocuments({ job: jobId })
    ]);

    return {
      totals,
      proposals
    };
  }

  async updateProposalStatus(
    proposalId: Types.ObjectId,
    clientId: Types.ObjectId,
    newStatus: ProposalStatus
  ) {
    const proposal = await Proposal.findById(proposalId).populate("job");

    if (!proposal) {
      logger.error(`Tried to update proposal does not exist`);
      throw new AppError("No proposal found with this id", 404);
    }

    const job = proposal.job as any;

    if (job.clientId.toString() !== clientId.toString()) {
      throw new AppError(
        "Forbidden: You do not have permission to perform this action",
        403
      );
    }

    if (proposal.status === ProposalStatus.ACCEPTED) {
      throw new AppError(
        "You cannot change proposal status when it's already accepted",
        400
      );
    }

    proposal.status = newStatus;

    await proposal.save();

    return {
      proposal
    };
  }
}

export default new ProposalService();
