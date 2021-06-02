const path = require("path");
const bunyan = require("bunyan");

const pjs = require("../../package.json");

// Get some meta info from the package.json
const { name, version } = pjs;

// Set up a logger
const getLogger = (serviceName, serviceVersion, level) =>
  bunyan.createLogger({ name: `${serviceName}:${serviceVersion}`, level });

module.exports = {
  development: {
    sitename: "Roux Meetups [Development]",
    seviceRegistryUrl: "http://localhost:3080",
    serviceVersion: "1.x.x",
    data: {
      feedback: path.join(__dirname, "../data/feedback.json"),
    },
    log: () => getLogger(name, version, "debug"),
  },
  production: {
    sitename: "Roux Meetups",
    seviceRegistryUrl: "http://localhost:3080",
    serviceVersion: "1.x.x",
    data: {
      feedback: path.join(__dirname, "../data/feedback.json"),
    },
    log: () => getLogger(name, version, "info"),
  },
};
