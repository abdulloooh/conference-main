const path = require("path");

module.exports = {
  development: {
    sitename: "Roux Meetups [Development]",
    data: {
      seviceRegistryUrl: "http://localhost:3080",
      serviceVersion: "1.x.x",
      feedback: path.join(__dirname, "../data/feedback.json"),
    },
  },
  production: {
    sitename: "Roux Meetups",
    data: {
      seviceRegistryUrl: "http://localhost:3080",
      serviceVersion: "1.x.x",
      feedback: path.join(__dirname, "../data/feedback.json"),
    },
  },
};
