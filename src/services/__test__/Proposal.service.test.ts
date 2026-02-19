import ProposalService from "@/services/Proposal.service";
import { makeProposal } from "@/tests/Factories/ProposalFactories";
import * as DB from "@/tests/DBHandler";
import { IUser, UserRoles } from "@/interfaces/IUser";
import User from "@/models/User.model";
import { makeUser } from "@/tests/Factories/UserFactories";
import { makeJob } from "@/tests/Factories/JobFactories";
import Job from "@/models/Job.model";
import Proposal from "@/models/Proposal.model";
import { Types } from "mongoose";
import { ProposalStatus } from "@/interfaces/IProposal";

let client: IUser;
let freelancer: IUser;

beforeAll(async () => {
  await DB.connect();
  client = await User.create(makeUser({ role: UserRoles.CLIENT }));
  freelancer = await User.create(makeUser());
});

afterEach(async () => await DB.clearData());
afterAll(async () => await DB.closeDbConnection());

describe("Test create proposal service ", () => {
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

describe("Test getAllProposalsByJob", () => {
  it("Should success when client want to see his proposal", async () => {
    const clientData = makeUser({ role: UserRoles.CLIENT });

    const clientTwo = await User.create(clientData);
    const freelancerOne = await User.create(makeUser());
    const freelancerTwo = await User.create(makeUser());
    const jobData = makeJob();
    const job = await Job.create({ ...jobData, clientId: clientTwo._id });
    const proposalDataOne = makeProposal(job._id, freelancerOne._id, 400);
    const proposalDataTwo = makeProposal(job._id, freelancerTwo._id, 500);

    // freelancer make proposals
    await Proposal.insertMany([
      {
        job: job._id,
        freelancer: proposalDataTwo.freelancer._id,
        coverLetter: proposalDataTwo.coverLetter,
        bidAmount: 500
      },
      {
        job: job._id,
        freelancer: proposalDataOne.freelancer._id,
        coverLetter: proposalDataOne.coverLetter,
        bidAmount: 500
      }
    ]);

    const { totals, proposals } = await ProposalService.getAllProposalsByJob(
      job._id,
      clientTwo._id
    );

    expect(totals).toBe(2);
    expect(proposals[0]?.bidAmount).toBe(500);
  });
  it("Should reject when client is not the job owner", async () => {
    const clientData = makeUser({ role: UserRoles.CLIENT });

    const clientTwo = await User.create(clientData);

    const jobData = makeJob();
    const job = await Job.create({ ...jobData, clientId: clientTwo._id });

    await expect(
      ProposalService.getAllProposalsByJob(job._id, client._id)
    ).rejects.toThrow("Forbidden: Access denied");
  });

  it("Should send zero has total proposal and empty array if the user has no proposal", async () => {
    // const clientData = makeUser({ role: UserRoles.CLIENT });

    // const clientTwo = await User.create(clientData);

    const jobData = makeJob();
    const job = await Job.create({ ...jobData, clientId: client._id });

    const { totals, proposals } = await ProposalService.getAllProposalsByJob(
      job._id,
      client._id
    );

    expect(totals).toBe(0);
    expect(proposals).toEqual([]);
  });

  it("Should reject when there is no job found with the provided id", async () => {
    await expect(
      ProposalService.getAllProposalsByJob(
        new Types.ObjectId(), // fake mongo id
        client._id
      )
    ).rejects.toThrow("No job found with this id.");
  });
});

describe("Test update proposal status", () => {
  it("Should update the proposal status", async () => {
    const client = await User.create(makeUser({ role: UserRoles.CLIENT }));
    const freelancer = await User.create(makeUser());
    const job = await Job.create(makeJob({ clientId: client._id }));
    const data = makeProposal(job._id, freelancer._id, 500);
    const { proposal } = await ProposalService.createProposal(
      data.job._id,
      data.freelancer._id,
      data.coverLetter,
      data.bidAmount
    );
    // accept the proposal
    const result = await ProposalService.updateProposalStatus(
      proposal._id,
      client._id,
      ProposalStatus.PENDING
    );

    expect(result.proposal.status).toBe(ProposalStatus.PENDING);
  });
  it("Should reject when no proposal is found", async () => {
    const client = await User.create(makeUser({ role: UserRoles.CLIENT }));
    const freelancer = await User.create(makeUser());
    const job = await Job.create(makeJob({ clientId: client._id }));

    // accept the proposal
    await expect(
      ProposalService.updateProposalStatus(
        new Types.ObjectId(),
        client._id,
        ProposalStatus.PENDING
      )
    ).rejects.toThrow("No proposal found with this id");
  });
  (it("Should reject if the user (client) is not the job owner", async () => {
    const client = await User.create(makeUser({ role: UserRoles.CLIENT }));
    const freelancer = await User.create(makeUser());
    const job = await Job.create(makeJob({ clientId: client._id }));
    const data = makeProposal(job._id, freelancer._id, 500);
    const { proposal } = await ProposalService.createProposal(
      data.job._id,
      data.freelancer._id,
      data.coverLetter,
      data.bidAmount
    );

    // accept the proposal
    await expect(
      ProposalService.updateProposalStatus(
        proposal._id,
        new Types.ObjectId(),
        ProposalStatus.PENDING
      )
    ).rejects.toThrow(
      "Forbidden: You do not have permission to perform this action"
    );
  }),
    it("Should reject when the proposal status is already accepted", async () => {
      const client = await User.create(makeUser({ role: UserRoles.CLIENT }));
      const freelancer = await User.create(makeUser());
      const job = await Job.create(makeJob({ clientId: client._id }));
      const data = makeProposal(job._id, freelancer._id, 500);
      const { proposal } = await ProposalService.createProposal(
        data.job._id,
        data.freelancer._id,
        data.coverLetter,
        data.bidAmount
      );
      // accept the proposal
      await ProposalService.updateProposalStatus(
        proposal._id,
        client._id,
        ProposalStatus.ACCEPTED
      );

      await expect(
        ProposalService.updateProposalStatus(
          proposal._id,
          client._id,
          ProposalStatus.ACCEPTED
        )
      ).rejects.toThrow(
        "You cannot change proposal status when it's already accepted"
      );
    }));
});
