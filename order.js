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

 module.exports.run = (event, context, callback) => {
    var ddb = getDynamoClient(event);

    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var unixtime = Math.floor(date.getTime() / 1000);
    var params = qs.parse(event.body);

    var data = {
      TableName: 'orders',
      Item: {
        user: params.user_id,
        unixtime: unixtime,
        year: year,
        month: month,
        name: params.user_name,
      },
    };

    ddb.put(data, (error) => {
      var response = { statusCode: null, body: null };
      if (error) {
        console.log(error);
        response.statusCode = 500;
        response.body = { code: 500, message: 'failed to put' }
      } else {
        response.statusCode = 200;
        response.body = JSON.stringify(params.Item)
      }
      callback(null, response)
    });
 };
