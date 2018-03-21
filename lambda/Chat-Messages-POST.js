'use strict';

const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB();
const sqs = new AWS.SQS();

const queueUrl = "https://sqs.us-east-1.amazonaws.com/923328157162/Chat-Message";

exports.handler = function (event, context, callback) {
    dynamo.query({
        TableName: 'Chat-Conversations',
        Select: 'ALL_ATTRIBUTES',
        KeyConditionExpression: 'ConversationId = :id',
        ExpressionAttributeValues: {
            ':id': {S: event.id}
        }
    }, function (err, data) {
        loadMessages(err, data, event, callback);
    });
};

function loadMessages(err, data, event, callback) {
    if (err === null) {
        var other = "";
        var flag = false;
        data.Items.forEach(function (message) {
            if (message.Username.S !== event.cognitoUsername) {
                other = message.Username.S;
            } else if (message.Username.S === event.cognitoUsername) {
                flag = true;
            }
        });
        if(flag === true)   {
            postMessages(event, other, callback);
        } else {
            callback("unauthorized!");
        }
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
        postReply(err, event, othername, callback);
    });
}

function postReply(err, event, othername, callback) {
    if (err === null) {
        // Automatically reply
        dynamo.putItem({
            TableName: 'Chat-Messages',
            Item: {
                ConversationId: {S: event.id},
                Timestamp: {
                    N: "" + new Date().getTime()
                },
                Message: {S: "This is the automatical reply!"},
                Sender: {S: othername}
            }
        }, function(err, data) {
            postQueue(err, event, callback)
        });
    } else {
        callback(err);
    }
}

function postQueue(err, event, callback) {
    if (err === null) {
        sqs.sendMessage({
            MessageBody: JSON.stringify(event),
			QueueUrl: queueUrl
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
