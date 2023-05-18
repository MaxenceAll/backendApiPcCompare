const allowedOrigins = require('../config/allowedOrigins');

const credentials = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', true);

    // New security conseils :
    // Enable HSTS
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    // Enable X-Content-Type-Options
    res.header('X-Content-Type-Options', 'nosniff');
    // Enable X-Frame-Options
    res.header('X-Frame-Options', 'SAMEORIGIN');
    // Enable Content-Security-Policy
    res.header('Content-Security-Policy', "default-src 'self'");

  }
  next();
}

module.exports = credentials