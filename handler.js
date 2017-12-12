"use strict"

var AWS = require("aws-sdk");

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

 module.exports.order = (event, context, callback) => {
    console.log(`received event: ${ JSON.stringify(event, null, 2) }`);
    console.log(`received context: ${ JSON.stringify(context, null, 2) }`);

    var ddb = getDynamoClient(event);
    var date = new Date();
    var month = date.getMonth() + 1;
    var unixtime = Math.floor(date.getTime() / 1000);
    var user = event.queryStringParameters.name;

    var params = {
      TableName: 'orders',
      Item: {
        user: user,
        month: month,
        unixtime: unixtime,
      },
    };

    ddb.put(params, (error) => {
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
