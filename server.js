// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 9000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

//--------------------------------------------
var cors = require('cors');             // this include for CORS issues


//------------------TWILLIO--------------------------------------------
//------------------TWILLIO--------------------------------------------
var config = require('./config/config.js');
var twilioNotifications = require('./app/twilioNotifications');


// ==============================================================================================================================
// ==============================================================================================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration


// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get rinformation from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'scotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// CORS -----------------------------------------------------------------------
var originsWhitelist = [
  'http://localhost:4200',              //Front end URL for development time.
   'https://zentomic-webadmin.herokuapp.com'     // Front end URL for deploy time, such as may be on heroku.
];
var corsOptions = {
  origin: function(origin, callback){
        var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
  },
  credentials:true
}
//here is the magic
app.use(cors(corsOptions));

//===============================Twillio=======================================
app.use(twilioNotifications.notifyOnError);


// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
//----------------------------

