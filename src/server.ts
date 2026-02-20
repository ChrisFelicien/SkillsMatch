import config from "@/config/env";
import app from "@/app";
import logger from "@/utils/logger";
import connectDB from "@/config/database";

process.on("uncaughtException", (err: Error) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  logger.error(`${err.name}: ${err.message}`);
  process.exit(1);
});

(async () => {
  try {
    await connectDB();
    const PORT = config.PORT || 5000;

    const server = app.listen(PORT, () => {
      logger.info(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      );
    });

    process.on("unhandledRejection", (err: Error) => {
      logger.error("UNHANDLED REJECTION! 💥");
      logger.error(`${err.name}: ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    logger.error("FAILED TO START SERVER ❌");
    logger.error((error as Error).message);
    process.exit(1);
  }
})();
