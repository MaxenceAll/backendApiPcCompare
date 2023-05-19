const rateLimit = require("express-rate-limit");
const durationToMilliseconds = require("./durationToMilliseconds");
const config = require("../config/config")

const limiter = rateLimit({
  windowMs: durationToMilliseconds(config.API.MAX_REQUEST_WINDOW), 
  max: config.API.MAX_REQUEST,
  message: "Trop de requêtes ! Re-essayez un peu plus tard.",
});

module.exports = limiter;
