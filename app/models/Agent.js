// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var AgentSchema = mongoose.Schema({

    local: {
        email: String,
        password: String,
        fullname: String,
    },
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String
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
AgentSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
AgentSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// checking if this  agentemail is verified or not
AgentSchema.methods.isVerified = function(activationkey) {
    return   this.activation.activated;
};


// get user id
AgentSchema.methods.getID = function(callback) {
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
module.exports = mongoose.model('Agents', AgentSchema);
