import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppError from "@/utils/AppError";
import config from "@/config/env";
import User from "@/models/User.model";
import { IJwt } from "@/interfaces/IJwt";
import logger from "@/utils/logger";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const headers = req.headers;

  if (!headers || !headers.authorization?.startsWith("Bearer")) {
    throw new AppError("No authorize token provided", 401);
  }

  const token = headers.authorization.split(" ")[1];

  if (!token) {
    throw new AppError("No token provided", 401);
  }

  try {
    const decoded = jwt.verify(token, config.JWT_ACCESS_TOKEN_SECRET) as IJwt;

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AppError("User no longer exist.", 404);
    }

    // check if the password was updated after token was issued
    const isPasswordBeenModified = user.passwordChangedAfter(decoded.iat);

    if (isPasswordBeenModified) {
      throw new AppError(
        "Password was updated recently, please login again",
        401
      );
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
