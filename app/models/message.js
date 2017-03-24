// app/models/user.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
  var messageSchema = mongoose.Schema({
    FromUser        : [Number],// id from user
    ToUser          : [Number],//id from user
    Message         : String,
    AtDateTime      : {type: Date, default: Date.now}
});

// methods ======================
// generating a hash

//-------------------------------------------------------------------------------------------

// create the model for users and expose it to our app
module.exports = mongoose.model('tbl_Message', messageSchema);
