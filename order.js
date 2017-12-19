"use strict"

var AWS = require("aws-sdk");
var qs = require('querystring');
var getDynamoClient = (event) => {
  var options = {};
  if ("isOffline" in event && event.isOffline) {
    options = ({
      region: "localhost",
      endpoint: "http://localhost:8001",
    });
  }
  return new AWS.DynamoDB.DocumentClient(options);
}

var buildParams = (event, body) => {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var unixtime = Math.floor(date.getTime() / 1000);

  return {
    TableName: 'Orders',
    Item: {
      User: body.user_id,
      Unixtime: unixtime,
      YearMonth: parseInt(`${year}${month}`),
      Name: body.user_name,
    },
  };
}

var processEvent = (event, callback) => {
  const ddb = getDynamoClient(event);
  const body = qs.parse(event.body);
  const params = buildParams(event, body);
  ddb.put(params, (error, data) => {
    if (error) {
      console.log(error);
      callback({
        response_type: "in_channel",
        text: "失敗しました…",
      })
    } else {
      callback(null, {
        response_type: "in_channel",
        text: "コーヒーどうぞ",
      })
    }
  });
}

module.exports.run = (event, context, callback) => {
    const done = (err, res) => callback(null, {
      statusCode: err ? '400' : '200',
      body: err ? (err.message || err) : JSON.stringify(res),
      headers: { 'Content-Type': 'application/json' },
    });
    processEvent(event, done)
};
