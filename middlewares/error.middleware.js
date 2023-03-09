import { logEvents } from "./logger.middleware.js";

const errorHandler = (err, req, res, next) => {
  const statusCode = [204, 400, 401, 403, 429, 503].includes(res.statusCode)
    ? res.statusCode
    : 500;

  logEvents(
    `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
    "errors.log"
  );

  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

export { errorHandler };
