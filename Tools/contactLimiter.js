const rateLimit = require("express-rate-limit");
const durationToMilliseconds = require("./durationToMilliseconds");

const contactLimiter = rateLimit({
  windowMs: durationToMilliseconds("4h"), 
  max: 2,
  message: "Pas de spam de mail svp !",
});

module.exports = contactLimiter;
