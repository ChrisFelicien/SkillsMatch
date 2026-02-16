import { IJob } from "@/interfaces/IJob";
import Job from "@/models/Job.model";
import AppError from "@/utils/AppError";
import logger from "@/utils/logger";
import { Types } from "mongoose";

type Query = Partial<
  Pick<
    IJob,
    "budget" | "category" | "skillsRequired" | "deadline" | "status" | "title"
  >
> & { page?: number; limit?: number; minBudget?: number; maxBudget?: number };

class JobServices {
  async createJob(data: IJob, clientId: Types.ObjectId) {
    const newJob = await Job.create({ ...data, clientId });

    logger.info("New job as been created", { id: newJob._id });

    return {
      job: newJob
    };
  }

  async getAllJobs(query: Query) {
    const queryObject: any = {};

    if (query.category) {
      queryObject.category = query.category;
    }

    if (query.title) {
      queryObject.title = { $regex: query.title, $options: "i" };
    }

    if (query.skillsRequired) {
      queryObject.skillsRequired = { $all: query.skillsRequired };
    }

    if (query.maxBudget || query.maxBudget) {
      queryObject.budget = {};
      if (query.maxBudget) queryObject.maxBudget.$lte = query.maxBudget;
      if (query.minBudget) queryObject.minBudget.$gte = query.maxBudget;
    }
    let page: number = query.page || 1;
    let limit: number = query.limit || 10;
    const skip: number = (page - 1) * limit; // Number of items must be skipped

    const jobs = await Job.find(queryObject)
      .skip(skip)
      .limit(limit)
      .sort("-createdAt");
    const totalJobs = await Job.countDocuments(queryObject);

    return {
      totalJobs,
      jobs
    };
  }

  async deleteJob(jobId: string, clientId: string) {
    const job = await Job.findOneAndDelete({ _id: jobId, clientId }); // This find unique job

    if (!job) {
      logger.error(
        `the user with id ${clientId} tried to delete job without the right access`,
        {
          id: clientId
        }
      );
      throw new AppError("No job found for this user with this id", 404);
    }

    logger.info("Job deleted", { id: job._id });
    return {
      message: "Job deleted"
    };
  }
}
export default new JobServices();
