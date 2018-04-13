function checkLocation(location) {
const validCities = ['new york', 'los angeles', 'chicago', 'houston', 'philadelphia', 'phoenix', 'san antonio', 'san diego', 'dallas', 'san jose',
'austin', 'jacksonville', 'san francisco', 'indianapolis', 'columbus', 'fort worth', 'charlotte', 'detroit', 'el paso', 'seattle', 'denver', 'washington dc',
'memphis', 'boston', 'nashville', 'baltimore', 'portland'];
return (validCities.indexOf(location.toLowerCase()) > -1);
}

function checkCuisine(cuisine) {
const validCuisines = ['chinese', 'korean', 'japanese'];
return (validCuisines.indexOf(cuisine.toLowerCase()) > -1);
}

exports.handler = (event, context, callback) => {
const slots = event.currentIntent.slots;
const Location = slots.Location;
const Cuisine = slots.Cuisine;
const People = slots.People;
const Date = slots.Date;
const Time = slots.Time;
const Phone = slots.Phone;

var delegateResp = {
    "dialogAction": {
        "type": "Delegate",
        "slots": slots
    }
};
var elicitResp = {
    "dialogAction": {
        "type": "ElicitSlot",
        "intentName": "DiningSuggestions",
        "slots": slots,
        "slotToElicit": "",
        "message": {
            "contentType": "PlainText",
            "content": ""
        }
    }
};


if (Location != null && !checkLocation(Location)) { //check Location

    elicitResp.dialogAction.slotToElicit = "Location";
    elicitResp.dialogAction.message.content = `We currently do not support ${Location} as a valid destination.  Can you try a different city?`

    callback(null, elicitResp);
} else if (Cuisine != null && !checkCuisine(Cuisine)) { //check Cuisine

    elicitResp.dialogAction.slotToElicit = "Cuisine";
    elicitResp.dialogAction.message.content = `We currently do not support ${Cuisine} as a valid cuisine. We only support chinese, korean and japanese. Which do you want?`

    callback(null, elicitResp);
} else { // delegate next action

    callback(null, delegateResp);
}

};
