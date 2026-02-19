import { Request, Response, NextFunction } from "express";
import ProposalService from "@/services/Proposal.service";
import catchAsync from "@/utils/catchAsyncError";
import { ProposalStatus } from "@/interfaces/IProposal";
import { Types } from "mongoose";
import AppError from "@/utils/AppError";

class ProposalController {
  createProposal = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const freelancerId = req.user._id;
      const { jobId, coverLetter, bidAmount } = req.body;

      const result = await ProposalService.createProposal(
        new Types.ObjectId(jobId),
        new Types.ObjectId(freelancerId),
        coverLetter,
        bidAmount
      );

      res.status(201).json({
        status: "success",
        data: {
          proposal: result.proposal
        }
      });
    }
  );

  getAllProposalByJob = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const jobId = req.params.jobId as string;
      const clientId = req.user._id.toString();

      const result = await ProposalService.getAllProposalsByJob(
        new Types.ObjectId(jobId),
        new Types.ObjectId(clientId)
      );

      res.status(200).json({
        status: "success",
        totals: result.totals,
        data: {
          proposals: result.proposals
        }
      });
    }
  );

  updateProposal = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const id = req.params.id as string; // Proposal id
      const { status: newStatus } = req.body;
      const clientId = req.user._id.toString();

      if (!Object.values(ProposalStatus).includes(newStatus)) {
        throw new AppError("Invalid status provided", 400);
      }

      const result = await ProposalService.updateProposalStatus(
        new Types.ObjectId(id),
        new Types.ObjectId(clientId),
        newStatus
      );

      res.status(200).json({
        status: "success",
        data: {
          proposal: result.proposal
        }
      });
    }
  );
}

export default new ProposalController();
