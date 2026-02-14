import { Types } from "mongoose";

export enum JobStatus {
  IN_PROGRESS = "in_progress",
  OPEN = "open",
  CLOSE = "close",
  COMPLETED = "completed",
  CANCELED = "canceled"
}

export interface IJob {
  title: string;
  description: string;
  category: string;
  skillsRequired: string[];
  budget: number;
  deadline?: Date;
  status: JobStatus;
  clientId: Types.ObjectId;
  proposalsCount: number;
}
