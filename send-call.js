// Twilio Credentials 
var accountSid = 'AC9eefedc914d6ea37bd3cf225103f5afe'; 
var authToken = '00d2cedb458cfeb28471025d86f9ad1b'; 
 
//require the Twilio module and create a REST client 
var client = require('twilio')(accountSid, authToken); 
 
client.calls.create({ 
    url: 'http://demo.twilio.com/docs/voice.xml',
    to: "+17809722423", 
    from: "+17786547256 ", 
}, function(err, result) { 
    console.log('New phone call started...');
    console.log(result);
    if (err) {
        // Handle error
        // Show appropriate message to user
        console.log(err);
    } else {
        // No error

        if (message.sid) {
            // Use sid here
            console.log("sid" + message.sid);
        }
    }
   // console.log(message.sid);
});