var mongoose = require('mongoose');


/*
This table records each user and every time they check into a place
*/
var CheckSchema = mongoose.Schema({

    user: String, //userID
    latitude: String,
    longitude: String,
    checkInTime: {type: Date, default: Date.now},
    notifyTime: Date,
    updated: Boolean  //once user enters pin, if successful, this is true

});


module.exports = mongoose.model('Check', CheckSchema);
