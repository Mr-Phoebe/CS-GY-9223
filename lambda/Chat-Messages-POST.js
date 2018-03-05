'use strict';

var AWS = require('aws-sdk');

var dynamo = new AWS.DynamoDB();

exports.handler = function (event, context, callback) {
    dynamo.query({
        TableName: 'Chat-Messages',
        ProjectionExpression: 'Sender',
        KeyConditionExpression: 'ConversationId = :id',
        ExpressionAttributeValues: {':id': {S: event.id}}
    }, function (err, data) {
        loadMessages(err, data, event, callback);
    });
};

function loadMessages(err, data, event, callback) {
    if (err === null) { 
        var other = "";
        data.Items.forEach(function (message) {
            if (message.Sender.S != event.cognitoUsername) {
                other = message.Sender.S;
            }
        });
        postMessages(event, other, callback);
    } else {
        callback(err);
    }
}

function postMessages(event, othername, callback) {
    dynamo.putItem({
        TableName: 'Chat-Messages',
        Item: {
            ConversationId: {S: event.id},
            Timestamp: {
                N: "" + new Date().getTime()
            },
            Message: {S: event.message},
            Sender: {S: event.cognitoUsername}
        }
    }, function(err, data) {
        postReply(err, event.id, othername, callback);
    });
}

function postReply(err, id, othername, callback) {
    if (err === null) {
        dynamo.putItem({
            TableName: 'Chat-Messages',
            Item: {
                ConversationId: {S: id},
                Timestamp: {
                    N: "" + new Date().getTime()
                },
                Message: {S: "This is the automatical reply!"},
                Sender: {S: othername}
            }
        }, function(err, data) {
            if(err !== null) {
                callback(err);
            } else {
                callback(null, null);
            }
        });
    } else {
        callback(err);
    }
}