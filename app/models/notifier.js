// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var notifierSchema = mongoose.Schema({
    FromUser        : String,
    Info            : {
      Fullname      : String,
      Fone          : String,
      Email         : String
    },
    Type            : String
});

// methods ======================


//-------------------------------------------------------------------------------------------

// create the model for users and expose it to our app
module.exports = mongoose.model('notifier', notifierSchema);
