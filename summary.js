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

var currentYearMonth = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return parseInt(`${year}${month}`)
}

var queryParams = (text) => {
  return new Promise((resolve, reject) => {
    const yearMonth = parseInt(text) || currentYearMonth()
    if (! (1 < (yearMonth / 100000) < 10)) {
      reject('メッセージの先頭に\'yyyyMM\'の形式で日付を指定してください')
      return
    }

    const params = {
      TableName: 'Orders',
      IndexName: 'YearMonthIndex',
      ExpressionAttributeValues: {
        ':ym': yearMonth,
      },
      KeyConditionExpression: 'YearMonth = :ym',
    };
    resolve({ yearMonth: yearMonth, params: params })
  })
}

var processEvent = (event, callback) => {
  const ddb = getDynamoClient(event);
  const body = qs.parse(event.body);

  queryParams(body.text)
    .then((result) => {
      ddb.query(result.params, (error, data) => {
        if (error) {
          console.log(error);
          callback({
            response_type: "in_channel",
            text: "失敗しました…",
          })
        } else if (data.Items.length === 0) {
          callback(null, {
            response_type: "in_channel",
            text: `${ result.yearMonth }の利用はありません`,
          })
        } else {
          callback(null, {
            response_type: "in_channel",
            text: `${ result.yearMonth }の集計です`,
            attachment: [{
              fields: countByUser(data.Items),
            }]
          })
        }
      })
    })
    .catch((message) => {
      callback({
        response_type: "in_channel",
        text: message,
      })
    });
}

 module.exports.run = (event, context, callback) => {
    const done = (err, res) => callback(null, {
      statusCode: err ? '400' : '200',
      body: err ? (err.message || JSON.stringify(err)) : JSON.stringify(res),
      headers: { 'Content-Type': 'application/json' },
    });
    processEvent(event, done)
 };
