'use strict';


// AWS 
const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();
const sns = new AWS.SNS();
const sqs = new AWS.SQS();

const queueUrl = "https://sqs.us-east-1.amazonaws.com/923328157162/Chat-Message";

// Yelp
const yelp = require('yelp-fusion');
const apiKey = 'VdRz5pcdB3wKOEp6j15nHH_DBL-OBY3pv_wR667HEWdkwu4W3N_Ag0M2Ei702f3d5nhWy8t6InJNoIprHlliwLVjJicmkJG0WDWUPgj8mbX9lSfr6E3FY01TEEe6WnYx';
const client = yelp.client(apiKey);

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
                getYelp(message.ReceiptHandle, messageBody.cognitoUsername, messageBody.message, callback);
            }
        }
        callback(null, null);
    } else {
        callback(err);
    }
}

function getYelp(receiptHandle, username, message, callback) {
    client.search({
        term:'Four Barrel Coffee',
        location: 'san francisco, ca'
    }).then(response => {
        sendText(receiptHandle, username, JSON.stringify(response.jsonBody.businesses[0].name) + JSON.stringify(response.jsonBody.businesses[0].location), callback);
    }).catch(err => {
        callback(err);
    });
}

function sendText(receiptHandle, username, message, callback) {
    sns.publish({
        Message: message,
        PhoneNumber: '+13472213193'
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
