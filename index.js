'use strict';

console.log('Loading function');

exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  console.log('Received context:', JSON.stringify(context, null, 2));
  console.log('Received callback:', JSON.stringify(callback, null, 2));
};
