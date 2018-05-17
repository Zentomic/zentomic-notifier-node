var mongoose = require('mongoose');


/*
determines which users should be notified
*/
var PushTokenSchema = mongoose.Schema({

    userId: String, //userID
    pushToken: String,
    
});


module.exports = mongoose.model('PushToken', PushTokenSchema);
