"use strict"

var AWS = require("aws-sdk");

module.exports.getOptions = (event) => {
  var options = {};
  if ("isOffline" in event && event.isOffline) {
    options = ({
      region: "localhost",
      endpoint: "http://localhost:8001",
    });
  }
  return options;
}
