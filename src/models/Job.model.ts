import { Schema, model } from "mongoose";
import { IJob, JobStatus } from "@/interfaces/IJob";

const JobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minLength: [10, "Title too short for a professional job"]
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minLength: [50, "Too short for a professional description"]
    },
    category: {
      type: String,
      required: true
    },
    skillsRequired: {
      type: [String],
      validate: {
        validator: function (values) {
          return values.length > 0;
        },
        message: "At least one skill is required to create a job"
      }
    },
    clientId: {
      type: Schema.Types.ObjectId,
      required: [true, "Client id is required"],
      ref: "User",
      index: true
    },
    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.OPEN
    },
    budget: {
      type: Number,
      validate: {
        validator: function (value) {
          return value > 0;
        },
        message: "Budget must be positive"
      }
    },
    proposalsCount: {
      type: Number,
      default: 0
    },
    deadline: Date
  },
  { timestamps: true }
);

JobSchema.index({ clientId: 1, budget: -1 });
JobSchema.index({ budget: -1, category: 1, status: 1 });

const Job = model<IJob>("Job", JobSchema);

export default Job;
