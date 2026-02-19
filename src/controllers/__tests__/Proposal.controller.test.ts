import app from "@/app";
import request from "supertest";
import * as DB from "@/tests/DBHandler";
import { makeUser } from "@/tests/Factories/UserFactories";
import { UserRoles } from "@/interfaces/IUser";
import { makeJob } from "@/tests/Factories/JobFactories";
import Job from "@/models/Job.model";
import { ProposalStatus } from "@/interfaces/IProposal";

beforeAll(async () => await DB.connect());
afterAll(async () => {
  await DB.closeDbConnection();
});

describe("Test proposal controller integration", () => {
  it("Should create a proposal", async () => {
    const clientData = makeUser({ role: UserRoles.CLIENT });
    const freelancerData = makeUser();

    const clientResponse = await request(app)
      .post("/api/v1/auth/register")
      .send(clientData);

    const freelancerResponse = await request(app)
      .post("/api/v1/auth/register")
      .send(freelancerData);

    const jobData = makeJob({ clientId: clientResponse.body.data.user._id });

    // create a job
    const job = await Job.create(jobData);

    const response = await request(app)
      .post(`/api/v1/jobs/${job._id}/proposals`)
      .send({ jobId: job._id, coverLetter: `Hello...`, bidAmount: 400 })
      .set("Authorization", `Bearer ${freelancerResponse.body.token}`);

    expect(response.body.status).toBe("success");
    expect(response.status).toBe(201);
  });

  it("Should get all proposal by job", async () => {
    const clientData = makeUser({ role: UserRoles.CLIENT });
    const freelancerData = makeUser();

    const clientResponse = await request(app)
      .post("/api/v1/auth/register")
      .send(clientData);

    const freelancerResponse = await request(app)
      .post("/api/v1/auth/register")
      .send(freelancerData);

    const jobData = makeJob({ clientId: clientResponse.body.data.user._id });

    // create a job
    const job = await Job.create(jobData);

    await request(app)
      .post(`/api/v1/jobs/${job._id}/proposals`)
      .send({ jobId: job._id, coverLetter: `Hello...`, bidAmount: 400 })
      .set("Authorization", `Bearer ${freelancerResponse.body.token}`);

    const response = await request(app)
      .get(`/api/v1/jobs/${job._id}/proposals`)
      .set("Authorization", `Bearer ${clientResponse.body.token}`);

    expect(response.body.status).toBe("success");
    expect(response.status).toBe(200);
    expect(response.body.totals).toBe(1);
    expect(response.body.data.proposals).toHaveLength(1);
  });

  it("Should change the proposal status", async () => {
    const clientData = makeUser({ role: UserRoles.CLIENT });
    const freelancerData = makeUser();

    const clientResponse = await request(app)
      .post("/api/v1/auth/register")
      .send(clientData);

    const freelancerResponse = await request(app)
      .post("/api/v1/auth/register")
      .send(freelancerData);

    const jobData = makeJob({ clientId: clientResponse.body.data.user._id });

    // create a job
    const job = await Job.create(jobData);

    const proposalResponse = await request(app)
      .post(`/api/v1/jobs/${job._id}/proposals`)
      .send({ jobId: job._id, coverLetter: `Hello...`, bidAmount: 400 })
      .set("Authorization", `Bearer ${freelancerResponse.body.token}`);

    const id = proposalResponse.body.data.proposal._id;

    const response = await request(app)
      .patch(`/api/v1/proposals/${id}/status`)
      .send({ status: ProposalStatus.ACCEPTED })
      .set("Authorization", `Bearer ${clientResponse.body.token}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.proposal.status).toBe(ProposalStatus.ACCEPTED);
  });

  it("Should reject when provided proposal status is not allowed", async () => {
    const clientData = makeUser({ role: UserRoles.CLIENT });
    const freelancerData = makeUser();

    const clientResponse = await request(app)
      .post("/api/v1/auth/register")
      .send(clientData);

    const freelancerResponse = await request(app)
      .post("/api/v1/auth/register")
      .send(freelancerData);

    const jobData = makeJob({ clientId: clientResponse.body.data.user._id });

    // create a job
    const job = await Job.create(jobData);

    const proposalResponse = await request(app)
      .post(`/api/v1/jobs/${job._id}/proposals`)
      .send({ jobId: job._id, coverLetter: `Hello...`, bidAmount: 400 })
      .set("Authorization", `Bearer ${freelancerResponse.body.token}`);

    const id = proposalResponse.body.data.proposal._id;

    const response = await request(app)
      .patch(`/api/v1/proposals/${id}/status`)
      .send({ status: "Hello" })
      .set("Authorization", `Bearer ${clientResponse.body.token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid status provided");
  });
});
