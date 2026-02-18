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

    logger.info("New proposal created", { id: proposal._id });
    return {
      proposal
    };
  }

  async getAllProposal() {}

  async updateProposalStatus() {}
}

export default new ProposalService();
