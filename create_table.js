'use strict';

console.log('Loading function');
const AWS = require('aws-sdk')
AWS.config.endpoint = new AWS.Endpoint('http://localhost:8000');

exports.handler = (event, context, callback) => {
  const ddb = new AWS.DynamoDB({apiVersiom: '2012-10-08'})
  let params = {
    AttributeDefinitions: [
      {
        AttributeName: 'CUSTOMER_ID',
        AttributeType: 'N',
      },
      {
        AttributeName: 'CUSTOMER_NAME',
        AttributeType: 'S',
      },
    ],
    KeySchema: [
      {
        AttributeName: 'CUSTOMER_ID',
        KeyType: 'HASH',
      },
      {
        AttributeName: 'CUSTOMER_NAME',
        KeyType: 'RANGE'
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
    TableName: 'CUSTOMER_LIST',
    StreamSpecification: {
      StreamEnabled: false,
    },
  }

  ddb.createTable(params, (err, data) => {
    if (err) {
      console.log("Error", err)
      callback(null, err);
    } else {
      console.log("Success", data.Table.KeySchema)
      callback(null, data.Table.KeySchema);
    }
  })
};
