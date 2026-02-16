import { Types } from "mongoose";
import { z } from "zod";

export const createJobSchema = z.object({
  body: z.object({
    title: z
      .string("Job title is required")
      .min(10, "Title is too short for a professional job"),

    description: z
      .string("Job description is required")
      .min(50, "Too short for a professional description"),

    category: z.string("Category is required"),

    skillsRequired: z
      .array(z.string())
      .min(1, "At least one skill is required"),

    budget: z.number("Budget is required").positive("Budget must be positive"),

    deadline: z.string().datetime().optional().or(z.date().optional())
  })
});

export const deleteJobSchema = z.object({
  params: z.object({
    jobId: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), {
        message: "Invalid mongo id"
      })
  })
});
