import { Request, Response, NextFunction } from "express";
import AppError from "@/utils/AppError";
import config from "@/config/env";
import logger from "@/utils/logger";

const sendErrorDev = (error: any, res: Response) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    error,
    stack: error.stack
  });
};

const sendErrorProd = (error: any, res: Response) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message
    });
  } else {
    // will be replaced by logger
    logger.error("ERROR 💥", error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong"
    });
  }
};

const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  let err = { ...error };

  err.message = error.message;
  err.name = error.name;

  // 1. Handle zod error
  if (error.name === "ZodError") {
    const message = error.issues
      .map((i: any) => `${i.path.join(".")}: ${i.message}`)
      .join(",");

    err = new AppError(`Invalid data: ${message}`, 400);
  }
  //  2. Handle duplicate fields
  if (error.code === 11000) {
    const value = err.keyValue ? Object.values(err.keyValue)[0] : "unknown";

    const message = `Duplicate value: ${value}. Please use another one.`;

    err = new AppError(message, 400);
  }
  // 3. handle JWT error
  if (error.name === "JsonWebTokenError") {
    err = new AppError("No valid token provided, Please login again", 401);
  }

  if (error.name === "TokenExpiredError") {
    err = new AppError("Token expired. Please login again", 401);
  }

  //   4. Cast error
  if (error.name === "CastError") {
    error = new AppError(`Invalid ${error.path}: ${error.value}.`, 400);
  }

  //   5. Validation mongo error
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((el: any) => el.message);

    err = new AppError(`Invalid input data. ${messages.join(". ")}`, 400);
  }

  if (config.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};

export default globalErrorHandler;
