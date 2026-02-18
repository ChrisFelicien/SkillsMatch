import { ProposalStatus } from "@/interfaces/IProposal";
import { Types } from "mongoose";

export const makeProposal = (
  job: Types.ObjectId,
  freelancer: Types.ObjectId,
  bidAmount: number
) => {
  return {
    job,
    freelancer,
    bidAmount,
    coverLetter: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
    createdAt: new Date(Date.now()),
    status: ProposalStatus.PENDING
  };
};
