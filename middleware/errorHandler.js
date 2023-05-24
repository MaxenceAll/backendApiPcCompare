const { logEvents } = require('./logEvents');
const { RateLimitError } = require('express-rate-limit');

const errorHandler = (err, req, res, next) => {
  logEvents(`${err.name}: ${err.message}`, 'errLog.txt');
  console.error(err.stack);

  if (err instanceof RateLimitError) {
    // Ajout d'une verif si l'erreur est à cause du RateLimiter
    res.status(429).json({ error: 'Trop de requête !' });
  } else {
  }
  res.status(500).send(err.message);
};

module.exports = errorHandler;