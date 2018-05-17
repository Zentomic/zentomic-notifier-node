var config = require('../config/config.js');
var client = require('twilio')(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);

module.exports.sendCall = function (to, from, callback) {
    client.calls.create({
        record: true,
        url: 'https://handler.twilio.com/twiml/EH2a1b76becf871954d96d92696b6412d2',
        to: to,
        from: config.TWILIO_NUMBER,
    })
    .then(call => console.log(call.sid))
    .done(callback);
}