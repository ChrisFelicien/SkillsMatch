import express from "express";
import { Request, Response, NextFunction } from "express";
import AuthRoutes from "@/routes/v1/Auth.routes";
import AppError from "@/utils/AppError";
import globalErrorHandler from "@/middlewares/Error.middlewares";
import jobRoutes from "@/routes/v1/Job.routes";
import proposalsRoutes from "@/routes/v1/Proposal.routes";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/proposals", proposalsRoutes);
app.use(/.*/, (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`${req.originalUrl}, is not defined is this server`, 404));
});

app.use(globalErrorHandler);

export default app;
