'use strict';

const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();
const sns = new AWS.SNS();
const sqs = new AWS.SQS();

const queueUrl = "https://sqs.us-east-1.amazonaws.com/923328157162/Chat-Message";


exports.handler = function (event, context, callback) {
    sqs.receiveMessage({
        MaxNumberOfMessages: 5,
        QueueUrl: queueUrl
    }, function(err, data) {
        handleMessages(err, data, callback);
    });
};

function handleMessages(err, data, callback) {
    if (err === null) {
        if (data && data.Messages) {
			var msgCount = data.Messages.length;
            for(var i = 0; i < msgCount; i++) {
				var message = data.Messages[i];
                var messageBody = JSON.parse(message.Body);
                console.log(messageBody.cognitoUsername);
                sendText(message.ReceiptHandle, messageBody.cognitoUsername, callback);
            }
        }
        callback(null, null);
    } else {
        callback(err);
    }
}

function sendText(receiptHandle, username, callback) {
    sns.publish({
        Message: `Hey, ${username}. You have a message!`,
        PhoneNumber: '+1347*******'
    }, function(err, data) {
        deleteText(err, receiptHandle, callback);
    });
}

function deleteText(err, receiptHandle, callback) {
    if(err === null) {
    	sqs.deleteMessage( {
    		QueueUrl: queueUrl,
    		ReceiptHandle: receiptHandle
    	}, function(err, data) {
            if(err !== null) {
                callback(err);
            }
    	});
    } else {
        callback(err);
    }
}
