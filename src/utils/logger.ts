import config from "@/config/env";
import winston from "winston";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  debug: "white"
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:MM:ss:ms"
  }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const transports = [
  new winston.transports.Console({
    level: config.NODE_ENV === "development" ? "debug" : "info",
    format: winston.format.colorize()
  }),

  new winston.transports.File({
    filename: "logs/error.logs",
    level: "error"
  }),

  new winston.transports.File({
    filename: "logs/all.logs"
  })
];

const logger = winston.createLogger({
  level: config.NODE_ENV === "development" ? "debug" : "warn",
  levels,
  format,
  transports
});

export default logger;
