"use strict"

const AWS = require("aws-sdk");
const qs = require('querystring');

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

const countByUser = (items) => {
  const count = {};
  items.forEach((e) => {
    const name = e['Name']
    const user_count = count[name] || 0
    count[name] = user_count + 1
  });
  return Object.keys(count).map((key) => {
    return {
      title: key,
      value: count[key] ,
    }
  })
}

const currentYearMonth = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return parseInt(`${year}${month}`)
}

const decideDateToSummarize = (text) => {
  return new Promise((resolve, reject) => {
    const yearMonth = parseInt(text) || currentYearMonth()
    if (! (1 < (yearMonth / 100000) < 10)) {
      reject('メッセージの先頭に\'yyyyMM\'の形式で日付を指定してください')
    }
    resolve(yearMonth)
  })
}

const buildParams = (yearMonth) => {
  return {
    yearMonth: yearMonth,
    params: {
      TableName: 'Orders',
      IndexName: 'YearMonthIndex',
      ExpressionAttributeValues: {
        ':ym': yearMonth,
      },
      KeyConditionExpression: 'YearMonth = :ym',
    },
  }
}

const query = (event, data) => {
  return new Promise((resolve, reject) => {
    const ddb = getDynamoClient(event);
    ddb.query(data.params, (error, result) => {
      if (error) {
        console.log(error);
        reject("失敗しました…")
      } else if (result.Items.length === 0) {
        resolve({
          response_type: "in_channel",
          text: `${ data.yearMonth }の利用はありません`,
        })
      } else {
        resolve({
          response_type: "in_channel",
          text: `${ data.yearMonth }の集計です`,
          attachments: [{
            fields: countByUser(result.Items),
          }]
        })
      }
    })
  })
}

const processEvent = (event) => {
  const body = qs.parse(event.body);

  return decideDateToSummarize(body.text)
    .then(buildParams)
    .then((data) => query(event, data))
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
