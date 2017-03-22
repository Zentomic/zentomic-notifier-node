// Twilio Credentials 
var accountSid = 'AC9eefedc914d6ea37bd3cf225103f5afe'; 
var authToken = '00d2cedb458cfeb28471025d86f9ad1b'; 
 
//require the Twilio module and create a REST client 
var client = require('twilio')(accountSid, authToken); 
 
client.messages.create({ 
    to: "+16047606726", 
    from: "+16042398484 ", 
    body: "This is the ship that made the Kessel Run in fourteen parsecs?", 
}, function(err, message) { 
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