const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Trop de requêtes ! Re-essayez un peu plus tard.",
});

module.exports = limiter;
