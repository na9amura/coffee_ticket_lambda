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

var processEvent = (event, callback) => {
  const ddb = getDynamoClient(event);
  const body = qs.parse(event.body);

  const query = {
    TableName: 'Orders',
    IndexName: 'YearMonthIndex',
    ExpressionAttributeValues: {
      ':ym': 201712,
    },
    KeyConditionExpression: 'YearMonth = :ym',
  };

  ddb.query(query, (error, data) => {
    if (error) {
      console.log(error);
      callback({
        response_type: "in_channel",
        text: "失敗しました…",
      })
    } else {
      callback(null, {
        response_type: "in_channel",
        text: "集計しました",
        attachment: [{
          fields: countByUser(data.Items),
        }]
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
