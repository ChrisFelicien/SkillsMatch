import jwt from "jsonwebtoken";
import { IJwt } from "@/interfaces/IJwt";
import config from "@/config/env";

export const generateAccessToken = (data: IJwt): string => {
  return jwt.sign(
    { userId: data.userId, role: data.role },
    config.JWT_ACCESS_TOKEN_SECRET,
    {
      expiresIn: config.JWT_ACCESS_TOKEN_EXPIRE_IN
    }
  );
};

export const generateRefreshToken = (data: IJwt): string => {
  return jwt.sign({ userId: data.userId }, config.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: config.JWT_REFRESH_TOKEN_EXPIRE_IN
  });
};
