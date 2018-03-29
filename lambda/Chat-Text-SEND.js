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

// ------- change time format

function getSecond(year, month, day, hour, minute) {
    var months = [
        0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 
    ];
    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) months[2] += 1;
    var days = year * 365 + parseInt((year - 1) / 4) - parseInt((year - 1) / 100) + parseInt((year - 1) / 400);
    for (var i = 1; i < month; i++) {
        days += months[i];
    }
    days += day - 1;
    var minutes = days * 24 * 60 + hour * 60 + minute;
    return minutes * 60; 
}

function changeTime(date, time) {
    var year = parseInt(date.substr(0, 4))
    var month = parseInt(date.substr(5, 7))
    var day = parseInt(date.substr(8, 10))
    var hour = parseInt(time.substr(0, 2))
    var minute = parseInt(time.substr(3, 5))

    return getSecond(year, month, day, hour, minute) - getSecond(1970, 1, 1, 0, 0);
}

// -------------

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
                getYelp(message.ReceiptHandle, messageBody, callback);
            }
        }
        callback(null, null);
    } else {
        callback(err);
    }
}

function getYelp(receiptHandle, message, callback) {
    client.search({
        term: 'food',
        location: message.slots.Location,
        categories: message.slots.Cuisine,
        limit: 1,
        open_at: changeTime(message.slots.Date, message.slots.Time)
    }).then(response => {
        sendText(receiptHandle, JSON.stringify(response.jsonBody.businesses[0]), message.slots.Phone, callback);
    }).catch(err => {
        callback(err);
    });
}

function sendText(receiptHandle, message, Phone, callback) {
    console.log(message);
    sns.publish({
        Message: message,
        PhoneNumber: Phone
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
