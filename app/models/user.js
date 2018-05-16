// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var UserSchema = mongoose.Schema({

    local: {
        email: String,
        password: String,
        firstname: String,
        middlename: String,
        lastname: String,
        paid: Boolean,
        enddate: Date,
        passcode: String,
        distresscode: String,
        isNotifier: Boolean,
    },
    activation: {
        activationKey: String,
        activated: {
            type: Boolean,
            default: false
        }
    }

});

// methods ======================
// generating a hash
UserSchema.methods.generateHash = function(passcode) {
    return bcrypt.hashSync(passcode, bcrypt.genSaltSync(8), null);
};

// checking if passcode is valid
UserSchema.methods.validPasscode = function(passcode) {
    return bcrypt.compareSync(passcode, this.local.passcode);
};

// checking if passcode is valid
UserSchema.methods.validDistresscode = function(distresscode) {
    return bcrypt.compareSync(distresscode, this.local.distresscode);
};

// checking if this  agentemail is verified or not
UserSchema.methods.isVerified = function(activationkey) {
    return   this.activation.activated;
};


// get user id
UserSchema.methods.getID = function(callback) {
    User.FindOne({
            'local.email': this.local.email
        },
        function(err, user) {
            //custom code here
            if (callback) callback(err, user);
        }
    );
};
//-------------------------------------------------------------------------------------------

// create the model for users and expose it to our app
module.exports = mongoose.model('User', UserSchema);
