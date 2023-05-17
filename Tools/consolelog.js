const fs = require("fs");
const path = require("path");
const util = require("util");

const logDirectoryPath = path.join(__dirname, '..', 'logs');

const logFilePath = path.join(logDirectoryPath, "GlobalLog.log");

function consolelog(...args) {
  const options = {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Europe/Paris",
  };
  const timestamp = new Date().toLocaleString("fr-FR", options);
  let logMessage = `${timestamp} :: `;
  
  for (let arg of args) {
    if (typeof arg === "object") {
      logMessage += util.inspect(arg, { depth: null }) + " ";
    } else {
      logMessage += arg + " ";
    }
  }
  logMessage += "\n";

  console.log(logMessage);

  fs.appendFile(logFilePath, logMessage, { flag: "a" }, (err) => {
    if (err) {
      console.error(`Error writing to log file: ${err}`);
    }
  });
}

// Create logs directory if it does not exist
if (!fs.existsSync(logDirectoryPath)) {
  fs.mkdirSync(logDirectoryPath);
}

module.exports = consolelog;
