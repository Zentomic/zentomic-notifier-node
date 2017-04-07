// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 9000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
//--------------------------------------------------------
// swagger-node-express
var argv = require('minimist')(process.argv.slice(2));
var swagger = require("swagger-node-express");
//--------------------------------------------------------
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
app.use(session({
    secret: 'zentomic'
  }));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// CORS -----------------------------------------------------------------------
// var originsWhitelist = [
//   'http://localhost:9000',              //Front end URL for development time.
//    'http://localhost:4200',              //Front end URL for development time.
//    'https://zentomic-webadmin.herokuapp.com',     // Front end URL for deploy time, such as may be on heroku.
//    'http://admin.realsafe.io'
// ];
// var corsOptions = {
//   origin: function (origin, callback) {
//     console.log("Origin:"+origin);
//     if (originsWhitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// }
//here is the magic
//app.use(cors(corsOptions));
app.use(cors()); // all origin

//===============================Twillio=======================================
// REALLY IMPORTANT
// COMMNENT by Tony because it send sms to admin fone whenever has problems
//
//app.use(twilioNotifications.notifyOnError);
//------- END OF REALLY IMPORTANT---------------------------------------------


// ==============================================================================================================================
// swagger
// ==============================================================================================================================
var subpath = express();
app.use("/v1", subpath);
swagger.setAppHandler(subpath);
app.use(express.static('dist'));
subpath.get('/', function (req, res) {
    res.sendfile(__dirname + '/dist/index.html');
});

swagger.setApiInfo({
    title: "Zentomic Real Estate Node API",
    description: "API Zentomic Real Estate ",
    termsOfServiceUrl: "",
    contact: "ngoctuan.zentonmic@gmail.com",
    license: "",
    licenseUrl: ""
});

swagger.configureSwaggerPaths('', 'api-docs', '');
var domain = 'localhost';
if(argv.domain !== undefined)
    domain = argv.domain;
else
    console.log('No --domain=xxx specified, taking default hostname "localhost".');
var applicationUrl = 'http://' + domain;
swagger.configure(applicationUrl, '1.0.0');


// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
//----------------------------
