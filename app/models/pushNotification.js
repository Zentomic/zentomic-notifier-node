var mongoose = require('mongoose');


/*
determines which users should be notified
*/
var CheckSchema = mongoose.Schema({

    user: String, //userID
    pid: String,
    
});


module.exports = mongoose.model('Check', CheckSchema);
