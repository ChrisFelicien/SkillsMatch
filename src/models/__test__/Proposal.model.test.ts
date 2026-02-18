import { IUser, UserRoles } from "@/interfaces/IUser";
import * as DB from "@/tests/DBHandler";
import { makeUser } from "@/tests/Factories/UserFactories";
import { makeJob } from "@/tests/Factories/JobFactories";
import { IJob } from "@/interfaces/IJob";
import Job from "@/models/Job.model";
import User from "@/models/User.model";
import Proposal from "@/models/Proposal.model";
import { makeProposal } from "@/tests/Factories/ProposalFactories";

let client: IUser;
let freelancer: IUser;
let job: IJob;

beforeAll(async () => {
  await DB.connect();
  client = await User.create(makeUser({ role: UserRoles.CLIENT }));
  freelancer = await User.create(makeUser());
  job = await Job.create(
    makeJob({
      clientId: client._id
    })
  );
});

afterEach(async () => await DB.clearData());

afterAll(async () => await DB.closeDbConnection());

describe("Test the proposal model", () => {
  it("Should create a proposal", async () => {
    const result = await Proposal.create(
      makeProposal(job._id, freelancer._id, 500)
    );

    expect(result.job).toEqual(job._id);
    expect(result.freelancer).toEqual(freelancer._id);
  });

  it("Should fail when coverLetter is missing", async () => {
    await expect(
      Proposal.create({
        job: job._id,
        freelancer: freelancer._id,
        bidAmount: 400
      })
    ).rejects.toThrow();
  });

  it("Should fail when bid amount is missing", async () => {
    await expect(
      Proposal.create({
        job: job._id,
        freelancer: freelancer._id,
        coverLetter: `cover letter provided`
      })
    ).rejects.toThrow();
  });

  it("Should fail when job id is not provided", async () => {
    await expect(
      Proposal.create({
        freelancer: freelancer._id,
        coverLetter: `cover letter provided`,
        bidAmount: 500
      })
    ).rejects.toThrow();
  });

  it("Should fail when freelancer id is not provided", async () => {
    await expect(
      Proposal.create({
        job: job._id,
        coverLetter: `cover letter provided`,
        bidAmount: 500
      })
    ).rejects.toThrow();
  });

  it("Should fail when user apply twice to a job", async () => {
    const result = await Proposal.create(
      makeProposal(job._id, freelancer._id, 500)
    );

    await expect(
      Proposal.create(makeProposal(job._id, freelancer._id, 500))
    ).rejects.toThrow();
  });
});
