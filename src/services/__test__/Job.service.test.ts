import * as DB from "@/tests/DBHandler";
import { makeUser } from "@/tests/Factories/UserFactories";
import { makeJob } from "@/tests/Factories/JobFactories";
import { IUser } from "@/interfaces/IUser";
import User from "@/models/User.model";
import JobServices from "@/services/Job.service";
import Job from "@/models/Job.model";

let user: IUser;

beforeAll(async () => {
  await DB.connect();
  const data = makeUser();

  user = await User.create(data);
});

beforeEach(async () => await DB.clearData());
afterAll(async () => await DB.closeDbConnection());

describe("Test job service integration", () => {
  it("Should create a new job", async () => {
    const data = makeJob();
    const { job } = await JobServices.createJob(data as any, user._id);

    expect(job.title).toBe(data.title);
    expect(job.clientId).toBe(user._id);
  });
});

describe("Test get all jobs integration", () => {
  it("Should filter jobs by category and minimum budget", async () => {
    await Job.create([
      makeJob({
        title: "React Developer",
        category: "Web",
        budget: 100,
        clientId: user._id
      }),
      makeJob({
        title: "Node Expert",
        category: "Web",
        budget: 500,
        clientId: user._id
      }),
      makeJob({
        title: "Web Designer",
        category: "Design",
        budget: 1000,
        clientId: user._id
      })
    ]);

    const result = await JobServices.getAllJobs({
      category: "Web",
      minBudget: 400
    });

    expect(result.jobs).toHaveLength(2);
    expect(result.jobs[0]?.title).toBe("React Developer");
  });

  it("Should search jobs by title using regex", async () => {
    await Job.create([
      makeJob({
        title: "React Developer",
        category: "Web",
        budget: 100,
        clientId: user._id
      }),
      makeJob({
        title: "Node Expert",
        category: "Web",
        budget: 500,
        clientId: user._id
      }),
      makeJob({
        title: "Web Designer",
        category: "Design",
        budget: 1000,
        clientId: user._id
      }),
      makeJob({
        title: "Fullstack web developer",
        category: "Developer",
        budget: 800,
        clientId: user._id
      })
    ]);

    const result = await JobServices.getAllJobs({ title: "web" });

    expect(result.jobs).toHaveLength(2);
    expect(result.jobs[0]?.category).toBe("Design");
    expect(result.jobs[1]?.category).toBe("Developer");
  });
});
