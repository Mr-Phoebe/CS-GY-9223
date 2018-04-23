'use strict';


// AWS 
const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();
const sns = new AWS.SNS();
const sqs = new AWS.SQS();
const dynamodb = new AWS.DynamoDB();

const queueUrl = "https://sqs.us-east-1.amazonaws.com/923328157162/Chat-Message";

// Yelp
const yelp = require('yelp-fusion');
const apiKey = 'VdRz5pcdB3wKOEp6j15nHH_DBL-OBY3pv_wR667HEWdkwu4W3N_Ag0M2Ei702f3d5nhWy8t6InJNoIprHlliwLVjJicmkJG0WDWUPgj8mbX9lSfr6E3FY01TEEe6WnYx';
const client = yelp.client(apiKey);

// ------- change format

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

function changeMessage(data) {
    var name = data.name;
    var address = data.location.display_address.join("");
    var phone = data.phone;
    
    var message = ""
    
    if (phone === "") {
        message = `We recommend you to go to ${name} to have dinner. It locates at ${address}. Have a good day! Thank you for using.`;
    } else {
        message = `We recommend you to go to ${name} to have dinner. It locates at ${address} and its phone number is ${phone}. Have a good day! Thank you for using.`;
    }
    return message;
}

// ------------- handler

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
                // getYelp(message.ReceiptHandle, messageBody, callback);
                getElasticSearchResult(message.ReceiptHandle, messageBody, callback);
            }
        }
        callback(null, null);
    } else {
        callback(err);
    }
}

function getElasticSearchResult(receiptHandle, message, callback) {
    const url =
        `https://search-test-53ovxqlaqknuaw6gkz5jfvjqaq.us-east-1.es.amazonaws.com/index3/_search?q=${message.Cuisine}&pretty`;
    const https = require("https");
    
    https.get(url, res => {
      res.setEncoding("utf8");
        
      let body = "";
      res.on("data", data => {
        body += data;
      });
      res.on("end", () => {
        body = JSON.parse(body);
        var items = body.hits.hits;
        
        getDetail(receiptHandle, items[0]._source.id, message, callback);
        
      });
    });
}

function getDetail(receiptHandle, id, message, callback) {
    var TABLE_NAME = 'Chat-Restaurant';
    var item = {
        TableName: TABLE_NAME,
        Key: { id: { S: id } }
    };
    
    dynamodb.getItem(item, function (err, data) {
        if (err) { console.log(err); }
        else {  
            data = data.Item;
            var name = data.name.S;
            var phone = data.phone.S;
            var address = data.address.S;
            
            var text = "";
            if (phone === "Null") {
                text = `We recommend you to go to ${name} to have dinner. It locates at ${address}. Have a good day! Thank you for using.`;
            } else {
                text = `We recommend you to go to ${name} to have dinner. It locates at ${address} and its phone number is ${phone}. Have a good day! Thank you for using.`;
            }
        
            sendText(receiptHandle, text, message.Phone, callback);
        }
    });

}

function getYelp(receiptHandle, message, callback) {
    client.search({
        term: 'food',
        location: message.Location,
        categories: message.Cuisine,
        limit: 1,
        open_at: changeTime(message.Date, message.Time)
    }).then(response => {
        console.log(response.jsonBody.businesses[0].name);
        sendText(receiptHandle, changeMessage(response.jsonBody.businesses[0]), message.Phone, callback);
    }).catch(err => {
        callback(err);
    });
}

function sendText(receiptHandle, message, Phone, callback) {
    console.log('The message is' + message);
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
