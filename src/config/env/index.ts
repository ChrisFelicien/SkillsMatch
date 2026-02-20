import dotenv from "dotenv";
import ms from "ms";

dotenv.config();

const config = {
  PORT: 5000,
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET as string,
  JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET as string,
  JWT_ACCESS_TOKEN_EXPIRE_IN: process.env
    .JWT_ACCESS_TOKEN_EXPIRE_IN as ms.StringValue,
  JWT_REFRESH_TOKEN_EXPIRE_IN: process.env
    .JWT_REFRESH_TOKEN_EXPIRE_IN as ms.StringValue,

  COOKIE_EXPIRE_IN: (7 * 24 * 60 * 60 * 1000) as number, // Expire in 7 days
  NODE_ENV: process.env.NODE_ENV as string,
  MONGO_URI: process.env.MONGO_URI as string
};

export default config;
