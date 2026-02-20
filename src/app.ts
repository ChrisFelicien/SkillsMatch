import express from "express";
import { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import hpp from "hpp";
import cors from "cors";
import rateLimit from "express-rate-limit";
import AuthRoutes from "@/routes/v1/Auth.routes";
import AppError from "@/utils/AppError";
import globalErrorHandler from "@/middlewares/Error.middlewares";

import jobRoutes from "@/routes/v1/Job.routes";
import proposalsRoutes from "@/routes/v1/Proposal.routes";

const app = express();

const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: "Too many requests from this IP, please try again in 15 minutes!"
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(hpp());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api", limiter);
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/proposals", proposalsRoutes);
app.use(/.*/, (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`${req.originalUrl}, is not defined is this server`, 404));
});

app.use(globalErrorHandler);

export default app;
