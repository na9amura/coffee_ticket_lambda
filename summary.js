'use strict';

module.exports.run = (event, context, callback) => {
  var options = require("./dynamodb_client").getOptions(event);
  var ddb = new AWS.DynamoDB.DocumentClient(options);

  var params = {
    TableName: 'orders',
    Key: { 'user': 'user1' }
  };

  ddb.get(params, (error, data) => {
    if (error) {
      console.log("Error", error)
    } else {
      console.log("Success", data)
    }
  })
};
