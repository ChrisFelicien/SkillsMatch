import { Schema, model } from "mongoose";
import { IProposal, ProposalStatus } from "@/interfaces/IProposal";

const ProposalSchema: Schema = new Schema<IProposal>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },
    freelancer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    coverLetter: {
      type: String,
      required: true
    },
    bidAmount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: Object.values(ProposalStatus),
      default: ProposalStatus.PENDING
    }
  },
  { timestamps: true }
);

ProposalSchema.index({ job: 1, freelancer: 1 }, { unique: true });

const Proposal = model<IProposal>("Proposal", ProposalSchema);

export default Proposal;
