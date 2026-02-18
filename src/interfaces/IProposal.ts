import mongoose, { Document } from "mongoose";

export enum ProposalStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  WITHDRAW = "withdrawn"
}

export interface IProposal extends Document {
  readonly job: mongoose.Types.ObjectId;
  readonly freelancer: mongoose.Types.ObjectId;
  coverLetter: string;
  bidAmount: number;
  status: ProposalStatus;
  createdAt: Date;
}
