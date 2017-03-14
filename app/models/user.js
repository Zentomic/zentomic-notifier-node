// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        email        : String,
        password     : String,
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};


//-------------------------------------------------------------------------------------------
// CRUD Section -- mapping the moongse functions
//Create
/*
    var newUser = User({
      local : {
                    email        : "abc@gmail.com",
                    password     : "12345",
                }
    });
    // Create a User model
    newUser.save(function(err){
        if (err) throw err;
        console.log('User created!');
    });
*/


//Read
/*
sample:
    User.FindOne(
        { 'local.email' :  "abc@gmail.com" }, 
        function(err, user) {
            //custom code here
            }
        );
        
        
     User.FindOne(
        { 'facebook.email' :  "abc@gmail.com" }, 
        function(err, user) {
            //custom code here
            }
        );
        
*/
// Update
/* 
    User.findOneAndUpdate({'local.email':"abc@gmail.com"}, {"local.email":'cba@gmail.com'}, function(err){
        if(err) throw err;
    });
*/
//Delete
/*
    User.findOneAndRemove({'local.email':"abc@gmail.com"}, function(err){
        if(err) throw err;
    });
*/

//---------------------------------- END CRUD SECTION ---------------------------------------


//-------------------------------------------------------------------------------------------

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);