import { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsyncError";
import JobService from "@/services/Job.service";

class JobController {
  createJob = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const data = req.body;
      const user = req.user;
      const job = await JobService.createJob(data, user._id);

      res.status(201).json({
        message: "Create a new job",
        job
      });
    }
  );
  getAllJob = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { totalJobs, jobs } = await JobService.getAllJobs(req.query);

      res.status(200).json({
        totalJobs,
        jobs
      });
    }
  );

  deleteJob = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = req.user;
      const jobId = req.params.jobId as string;

      await JobService.deleteJob(jobId, user._id.toString());

      res.status(204).end();
    }
  );
}

export default new JobController();
