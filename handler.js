"use strict"

var AWS = require("aws-sdk");

var judgeJanken = (a, b) => {
  var c = (a - b + 3) % 3;
  if (c === 0) {
    return "draw";
  } else if (c === 2) {
    return "win";
  } else {
    return "lose";
  }
}

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

 module.exports.playJanken = (event, context, callback) => {
   console.log(`received event: ${ JSON.stringify(event, null, 2) }`);
   console.log(`received context: ${ JSON.stringify(context, null, 2) }`);

   var dynamodb = getDynamoClient(event);
   var date = new Date();
   var unixtime = Math.floor(date.getTime() / 1000);

   var hand = ['rock', 'sissors', 'paper'];
   var player_name = event.queryStringParameters.name;
   var player_hand = event.queryStringParameters.hand;
   var player = hand.indexOf(player_hand);
   var computer = Math.floor(Math.random() * 3);
   var judge = judgeJanken(player, computer);

   var params = {
     TableName: 'jankens',
     Item: {
       player: player_name,
       unixtime: unixtime,
       player_hand: player_hand,
       computer_hand: hand[computer],
       judge: judge,
     }
   };

   dynamodb.put(params, (error) => {
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
