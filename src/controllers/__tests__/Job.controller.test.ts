import request from "supertest";
import { closeDbConnection, connect, clearData } from "@/tests/DBHandler";
import User from "@/models/User.model";
import Job from "@/models/Job.model";
import { UserRoles } from "@/interfaces/IUser";
import { makeUser } from "@/tests/Factories/UserFactories";
import app from "@/app";
import { makeJob } from "@/tests/Factories/JobFactories";

beforeAll(async () => {
  await connect();
});

afterEach(async () => await clearData());

afterAll(async () => closeDbConnection());

describe("Test job controller integration", () => {
  (it("Should fail to create a job if the user is not a client", async () => {
    const userData = makeUser();
    const jobData = makeJob();
    // create valid user with role freelance, with valid token to test the route
    const userResponse = await request(app)
      .post("/api/v1/auth/register")
      .send(userData);

    //
    const jobResponse = await request(app)
      .post("/api/v1/jobs")
      .send(jobData)
      .set("Authorization", `Bearer ${userResponse.body.token}`);
    expect(jobResponse.status).toBe(403);
    expect(jobResponse.body.message).toBe(
      "Forbidden: You do not have permission to perform this action"
    );
  }),
    it("Should create a job if the user is not a client", async () => {
      const userData = makeUser({ role: UserRoles.CLIENT });
      const jobData = makeJob();

      const userResponse = await request(app)
        .post("/api/v1/auth/register")
        .send(userData);

      const jobResponse = await request(app)
        .post("/api/v1/jobs")
        .send(jobData)
        .set("Authorization", `Bearer ${userResponse.body.token}`);

      expect(jobResponse.status).toBe(201);
    }));

  it("Should delete a job", async () => {
    const userData = makeUser({ role: UserRoles.CLIENT });
    const jobData = makeJob();

    const userResponse = await request(app)
      .post("/api/v1/auth/register")
      .send(userData);

    const jobResponse = await request(app)
      .post("/api/v1/jobs")
      .send(jobData)
      .set("Authorization", `Bearer ${userResponse.body.token}`);

    const result = await request(app)
      .delete(`/api/v1/jobs/${jobResponse.body.job.job._id}`)
      .set("Authorization", `Bearer ${userResponse.body.token}`);

    expect(result.status).toBe(204);
  });

  it("Should get all job", async () => {
    const jobData = makeJob();
    const userData = makeUser();
    const user = await User.create(userData);
    await Job.create({ ...jobData, clientId: user._id });

    const response = await request(app).get("/api/v1/jobs");

    expect(response.status).toBe(200);
    expect(response.body.totalJobs).toBe(1);
    expect(response.body.jobs[0].title).toBe(jobData.title);
  });

  it("Should filter jobs by skillsRequired", async () => {
    const userData = makeUser();
    const user = await User.create(userData);
    await Job.insertMany([
      {
        ...makeJob({ skillsRequired: ["react", "node"] }),
        clientId: user._id
      },
      {
        ...makeJob({ skillsRequired: ["java", "htm"] }),
        clientId: user._id
      },
      {
        ...makeJob({ skillsRequired: ["react", "fx"] }),
        clientId: user._id
      },
      {
        ...makeJob({ skillsRequired: ["vue", "css"] }),
        clientId: user._id
      }
    ]);

    const response = await request(app).get(
      "/api/v1/jobs?skillsRequired=react"
    );

    expect(response.status).toBe(200);
    expect(response.body.totalJobs).toBe(2);
    expect(response.body.jobs[0].skillsRequired).toContain("react");
  });
});
