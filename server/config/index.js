const path = require("path");

module.exports = {
  development: {
    sitename: "Roux Meetups [Development]",
    seviceRegistryUrl: "http://localhost:3080",
    serviceVersion: "1.x.x",
    data: {
      feedback: path.join(__dirname, "../data/feedback.json"),
    },
  },
  production: {
    sitename: "Roux Meetups",
    seviceRegistryUrl: "http://localhost:3080",
    serviceVersion: "1.x.x",
    data: {
      feedback: path.join(__dirname, "../data/feedback.json"),
    },
  },
};
