const pino = require("pino");

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact: {
    paths: [
      "token",
      "accessToken",
      "refreshToken",
      "req.headers.authorization",
      "req.cookies.accessToken",
      "req.cookies.refreshToken",
    ],
    censor: "[Redacted]",
  },
});

module.exports = logger;
