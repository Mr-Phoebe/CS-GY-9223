
const AWS = require('aws-sdk');
const sqs = new AWS.SQS();
const queueUrl = "https://sqs.us-east-1.amazonaws.com/923328157162/Chat-Message";

exports.handler = (event, context, callback) => {
    const slots = event.currentIntent.slots;
    const Location = slots.Location;
    const Cuisine = slots.Cuisine;
    const People = slots.People;
    const Date = slots.Date;
    const Time = slots.Time;
    const Phone = slots.Phone;

    var data = {
      Location: Location,
      Cuisine: Cuisine,
      People: People,
      Date: Date,
      Time: Time,
      Phone: Phone
    };

    sqs.sendMessage({
        MessageBody: JSON.stringify(data),
		QueueUrl: queueUrl
    }, function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data.MessageId);
            callback(null, {
              "dialogAction": {
                "type": "Close",
                "fulfillmentState": "Fulfilled",
                "message": {
                  "contentType": "PlainText",
                  "content": `Youre all set. Expect my recommendations shortly! Have a good day!
                  Location is ${Location},
                  Cuisine is ${Cuisine},
                  ${People} people,
                  ${Date} ${Time},
                  phone number is ${Phone}`
                }
              }
            });
        }
    });

    // postQueue(data, );
    // var params = {
    //     MessageBody: JSON.stringify(msg),
    //     QueueUrl: "https://sqs.us-east-1.amazonaws.com/941947388672/chat_queue",
    //     DelaySeconds: 0
    // };

    // sqs.sendMessage(params, function(err, data) {

    //   if (err) {
    //     console.log("Error", err);
    //   } else {
    //     console.log("Success", data.MessageId);
    //     callback(null, {
    //       "dialogAction": {
    //         "type": "Close",
    //         "fulfillmentState": "Fulfilled",
    //         "message": {
    //           "contentType": "PlainText",
    //           "content": `Youre all set. Expect my recommendations shortly! Have a good day!
    //           location is ${location},
    //           cuisine is ${cuisine},
    //           ${people} people,
    //           ${date} ${time},
    //           phone number is ${phone}`
    //         }
    //       }
    //     });
    //   }
    // });

    // postQueue(data, callback);
};


