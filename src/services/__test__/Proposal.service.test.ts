import ProposalService from "@/services/Proposal.service";
import { makeProposal } from "@/tests/Factories/ProposalFactories";
import * as DB from "@/tests/DBHandler";
import { IUser, UserRoles } from "@/interfaces/IUser";
import User from "@/models/User.model";
import { makeUser } from "@/tests/Factories/UserFactories";
import { makeJob } from "@/tests/Factories/JobFactories";
import { IJob } from "@/interfaces/IJob";
import Job from "@/models/Job.model";
import logger from "@/utils/logger";

let client: IUser;
let freelancer: IUser;

beforeAll(async () => {
  await DB.connect();
  client = await User.create(makeUser({ role: UserRoles.CLIENT }));
  freelancer = await User.create(makeUser());
});

afterEach(async () => await DB.clearData());
afterAll(async () => await DB.closeDbConnection());

describe("Test proposal service ", () => {
  it("Should create proposal", async () => {
    const job = await Job.create(makeJob({ clientId: client._id }));
    const data = makeProposal(job._id, freelancer._id, 500);
    const result = await ProposalService.createProposal(
      data.job._id,
      data.freelancer._id,
      data.coverLetter,
      data.bidAmount
    );

    expect(result.proposal._id).toBeDefined();
    expect(result.proposal.freelancer).toEqual(freelancer._id);
  });

  it("Should fail when the is no job found with provided id", async () => {
    const job = await Job.create(makeJob({ clientId: client._id }));
    const data = makeProposal(job._id, freelancer._id, 500);

    await expect(
      ProposalService.createProposal(
        data.freelancer._id, // This is for fake mongo id
        data.freelancer._id,
        data.coverLetter,
        data.bidAmount
      )
    ).rejects.toThrow("Job not found");
  });

  it("Should fail when user try to proposal to his job", async () => {
    const job = await Job.create(makeJob({ clientId: client._id }));
    const data = makeProposal(job._id, freelancer._id, 500);

    await expect(
      ProposalService.createProposal(
        data.job._id,
        client._id,
        data.coverLetter,
        data.bidAmount
      )
    ).rejects.toThrow("You can not apply to your own job");
  });

  it("Should fail when user is not a client", async () => {
    const job = await Job.create(makeJob({ clientId: client._id }));
    const data = makeProposal(job._id, freelancer._id, 500);
    const newClient = await User.create(makeUser({ role: UserRoles.CLIENT }));

    await expect(
      ProposalService.createProposal(
        data.job._id,
        newClient._id,
        data.coverLetter,
        data.bidAmount
      )
    ).rejects.toThrow("Only freelancer can apply to job");
  });
});
