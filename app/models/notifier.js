// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var NotifierSchema = mongoose.Schema({
    FromAgent       : String,
    Type            : String,
    Info            : {
      Fullname      : String,
      Fone          : String,
      Email         : String
    },
    local            : {
        email        : String,
        password     : String,
        fullname     : String
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }
});

// methods ======================

//-------------------------------------------------------------------------------------------

// create the model for users and expose it to our app
module.exports = mongoose.model('Notifiers', NotifierSchema);
