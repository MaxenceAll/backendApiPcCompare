const { format } = require("date-fns");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const consolelog = require("../Tools/consolelog");

const logEvents = async (message, logName) => {
  // consolelog('Logging event:', message);
  const dateTime = `${format(new Date(), "dd/MM/yyyy\tHH:mm:ss")}`;
  const logItem = `${dateTime}\t${message}\n`;

  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }

    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logName),
      logItem
    );
  } catch (err) {
    console.log(err);
  }
};

const sanitizeRequestBody = (body) => {
  if (!body) {
    return null;
  }
  const sanitizedBody = { ...body };
  for (const key in sanitizedBody) {
    if (sanitizedBody.hasOwnProperty(key) && key.toLowerCase().includes("password")) {
      sanitizedBody[key] = "*** MASKED ***";
    }
  }
  return sanitizedBody;
};

const logger = async (req, res, next) => {
  const ip =
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);

  const start = Date.now();

  res.on("finish", async () => {
    const duration = Date.now() - start;
    const sanitizedBody = sanitizeRequestBody(req.body);

    await logEvents(
      `${ip}\t${req.method}\t${req.headers.origin}\t${req.url}\tBody:[${sanitizedBody ? JSON.stringify(sanitizedBody) : null}]\t(${res.statusCode})\t${duration}ms`,
      "reqLog.txt"
    );
  });

  console.log(`${req.method} ${req.path} ${ip}`);
  next();
};

module.exports = { logger, logEvents };
