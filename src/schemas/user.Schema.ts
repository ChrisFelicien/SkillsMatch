import { z } from "zod";
import { UserRoles } from "@/interfaces/IUser";

export const loginSchema = z.object({
  body: z.object({
    email: z.email(""),
    password: z.string()
  })
});

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, "First name is too short"),
    lastName: z.string().min(2, "Last name is too short"),
    email: z.email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(UserRoles),
    location: z.object({
      country: z.string(),
      city: z.string()
    })
  })
});
