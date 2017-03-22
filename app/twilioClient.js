var config = require('../config/config.js');
var client = require('twilio')(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);

module.exports.sendSms = function(to, message, callback) {
  client.messages.create({
    body: message,
    to: to,
    from: config.TWILIO_NUMBER
    // mediaUrl: 'http://www.yourserver.com/someimage.png'
  }, function(err, data) {
    if (err) {
      console.error('Could not notify administrator');
      console.error(err);
    } else {
      console.log('Administrator notified');
    }
    
    if(callback)
          callback(err, data)
  });
};