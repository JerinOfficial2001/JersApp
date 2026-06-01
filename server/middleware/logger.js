const fs = require("fs");
const path = require("path");

const get12HourTimestamp = () => {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const strHours = String(hours).padStart(2, "0");
  return `${strHours}:${minutes}:${seconds} ${ampm}`;
};

const getDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const logger = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const timestamp = get12HourTimestamp();
    const logMessage = `[${timestamp}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Time: ${duration}ms`;
    
    console.log(logMessage);

    const logFileName = `${getDateString()}.log`;
    const logFilePath = path.join(__dirname, "../logs", logFileName);
    fs.appendFile(logFilePath, logMessage + "\n", (err) => {
      if (err) console.error("Failed to write to log file:", err);
    });
  });
  next();
};

module.exports = logger;
