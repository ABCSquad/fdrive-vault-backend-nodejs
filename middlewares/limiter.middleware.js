import rateLimit from "express-rate-limit";

const windowMs = 60 * 1000;
const rateLimiter = (maxAttempts) =>
  rateLimit({
    windowMs: windowMs,
    max: maxAttempts, // Limit each IP to 5 login requests per `window` per minute
    message: {
      message: `Too many requests sent, please try again after ${
        windowMs / 1000
      } seconds.`,
    },
    handler: (req, res, next, options) => {
      res.status(options.statusCode).send(options.message);
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });

export default rateLimiter;
