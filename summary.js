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
    var params = qs.parse(event.body);

    var query = {
      TableName: 'Orders',
      IndexName: 'YearMonthIndex',
      ExpressionAttributeValues: {
        ':ym': 201712,
      },
      KeyConditionExpression: 'YearMonth = :ym',
    };

    ddb.query(query, (error, data) => {
      var response = {};
      if (error) {
        console.log(error);
        response.statusCode = 500;
        response.body = { code: 500, message: 'failed to query' }
      } else {
        response.statusCode = 200;
        response.body = JSON.stringify(data.Items)
      }
      callback(null, response)
    })
 };
