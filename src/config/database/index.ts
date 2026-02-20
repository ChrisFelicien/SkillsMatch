import mongoose from "mongoose";
import logger from "@/utils/logger";
import config from "@/config/env";

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.MONGO_URI as string, {
      autoIndex: true
    });

    logger.info(`Mongo database connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default connectDB;
