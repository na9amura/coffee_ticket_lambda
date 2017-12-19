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

var countByUser = (items) => {
  var count = {};
  items.forEach((e) => { 
    var name = e['Name']
    var user_count = count[name] || 0
    count[name] = user_count + 1
  });
  return Object.keys(count).map((key) => {
    return {
      title: key,
      value: count[key] ,
    }
  })
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
      var response = {
        statusCode: '200',
        body: {},
        headers: { 'Content-Type': 'application/json' },
      }
      if (error) {
        console.log(error);
        response.body = {
          response_type: "in_channel",
          text: "失敗しました…",
        }
      } else {
        response.body = {
          response_type: "in_channel",
          text: "集計しました",
          attachment: [{
            fields: countByUser(data.Items),
          }]
        }
      }
      callback(null, response)
    })
 };
