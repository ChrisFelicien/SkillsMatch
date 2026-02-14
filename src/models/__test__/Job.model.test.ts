import { makeUser } from "@/tests/Factories/UserFactories";
import { makeJob } from "@/tests/Factories/JobFactories";
import * as DB from "@/tests/DBHandler";
import Job from "@/models/Job.model";
import User from "@/models/User.model";
import { IUser } from "@/interfaces/IUser";

let user: IUser;

beforeAll(async () => {
  const userData = makeUser();
  await DB.connect();
  user = await User.create(userData);
});
afterEach(async () => await DB.clearData());
afterAll(async () => await DB.closeDbConnection());

describe("Job model test", () => {
  it("Should fail when budget is negative", async () => {
    const jobData = makeJob({ budget: -2000, clientId: user._id });

    await expect(Job.create(jobData)).rejects.toThrow(
      "Budget must be positive"
    );
  });

  it("Should fail when the budget is null (zero)", async () => {
    const userData = makeUser();
    const jobData = makeJob({ budget: 0, clientId: user._id });

    await expect(Job.create(jobData)).rejects.toThrow(
      "Budget must be positive"
    );
  });

  it("Should fail when no required skill is provided", async () => {
    const userData = makeUser();

    const jobData = makeJob({ skillsRequired: [], clientId: user._id });

    await expect(Job.create(jobData)).rejects.toThrow(
      "At least one skill is required to create a job"
    );
  });
  it("Should fail when no client Id is provided", async () => {
    const userData = makeUser();

    const jobData = makeJob();

    await expect(Job.create(jobData)).rejects.toThrow("Client id is required");
  });

  it("Should fail when the client Id no a valid mongo id", async () => {
    const userData = makeUser();

    const jobData = makeJob({ clientId: "invalidId" } as any);

    await expect(Job.create(jobData)).rejects.toThrow(
      "Cast to ObjectId failed"
    );
  });

  it("Should fail when description is too short", async () => {
    const userData = makeUser();

    const jobData = makeJob({ description: "Hello job", clientId: user._id });

    await expect(Job.create(jobData)).rejects.toThrow(
      "Too short for a professional description"
    );
  });

  it("Should fail when tile is too short", async () => {
    const userData = makeUser();

    const jobData = makeJob({ title: "Hello", clientId: user._id });

    await expect(Job.create(jobData)).rejects.toThrow(
      "Title too short for a professional job"
    );
  });

  it("Should create a job", async () => {
    const userData = makeUser();

    const jobData = makeJob({ clientId: user._id });

    const job = await Job.create(jobData);

    expect(job.title).toBe(jobData.title);
  });
});
