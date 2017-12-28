"use strict"

var AWS = require("aws-sdk");
var qs = require('querystring');

const buildDynamoClientOptions = (event) => {
  if ("isOffline" in event && event.isOffline) {
    return {
      region: "localhost",
      endpoint: "http://localhost:8001",
    }
  }
  return {}
}

const getDynamoClient = (event) => {
  return new AWS.DynamoDB.DocumentClient(buildDynamoClientOptions(event));
}

const buildParams = (event, body) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const unixtime = Math.floor(date.getTime() / 1000);

  return {
    TableName: 'Orders',
    Item: {
      User: body.user_id,
      Unixtime: unixtime,
      YearMonth: parseInt(`${year}${month}`),
      Name: body.user_name,
    },
  }
}

const putRecord = (args) => {
  return new Promise((resolve, reject) => {
    args.ddb.put(args.params, (error, data) => {
      if (error) {
        console.log(error);
        reject("失敗しました…")
      } else {
        console.log(data);

        resolve({
          response_type: "in_channel",
          text: `コーヒーどうぞ。注文番号: \`${ args.params.Item.Unixtime }\``,
        })
      }
    })
  })
}

const processEvent = (event) => {
  const body = qs.parse(event.body);

  return Promise.all([buildParams(event, body), getDynamoClient(event)])
    .then((result) => { return { params: result[0], ddb: result[1] } })
    .then(putRecord)
}

module.exports.run = (event, context, callback) => {
  processEvent(event)
    .then((result) => {
      callback(null, {
        statusCode: '200',
        body: JSON.stringify(result),
        headers: { 'Content-Type': 'application/json' },
      })
    })
    .catch((error) => {
      callback(null, {
        statusCode: '400',
        body: error.message || JSON.stringify(error),
        headers: { 'Content-Type': 'application/json' },
      })
    })
};
