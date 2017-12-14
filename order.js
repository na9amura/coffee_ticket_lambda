"use strict"

 module.exports.run = (event, context, callback) => {
    console.log(`received event: ${ JSON.stringify(event, null, 2) }`);
    console.log(`received context: ${ JSON.stringify(context, null, 2) }`);

    var options = require("./dynamodb_client").getOptions(event);
    var ddb = new AWS.DynamoDB.DocumentClient(options);
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
