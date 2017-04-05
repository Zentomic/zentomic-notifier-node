
// load up the user model
var User       = require('../app/models/Agent');
var Notifier   = require('../app/models/Notifier');
var SMS        = require('../app/twilioClient');
var ReqParam   = require('../config/ReqParam');
var CoreFunc   = require('../app/core/corefunc.js');

var corefunc  = new CoreFunc();

module.exports = function(app, passport) {


    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    // app.post('/login', do all our passport stuff here);

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });


    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    // =====================================
    // GOOGLE ROUTES =======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.post('/auth/google/callback',
            passport.authenticate('google', {
                    successRedirect : '/profile',
                    failureRedirect : '/'
            }));


    // process the signup form
    // app.post('/signup', do all our passport stuff here);

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    //---------------------------------------------------------------------------------------------------------------------------
    //  process for login Code by Tony
    //---------------------------------------------------------------------------------------------------------------------------

    // local signup
    // create agent
    app.get('/signup-local', function(req, res){

        var result = {err: null, data: null};

        var email = ReqParam(req, 'email');
        var password = ReqParam(req, 'password');
        var fullname = ReqParam(req, 'fullname');

        User.findOne(
        { 'local.email' : email },
        function(err, user) {
            //custom code here
                 // if there are any errors, return the error
            if (!err)
            {
               // check to see if theres already a user with that email
                if (user) {
                    result.data = "email already registered " + user;
                } else {

                // if there is no user with that email
                // create the user
                var newUser            = new User();

                // set the user's local credentials
                newUser.local.email    = email;
                newUser.local.fullname    = fullname;
                newUser.local.password = newUser.generateHash(password);

                // save the user
                newUser.save(function(err) {
                    if (err) throw err;
                    result.data = newUser;
                });
                }
            }
            else result.err = err;

            res.send(result);
           // responed;
            }


        );



    });

     //  process for login local
     // never return user data when login successful
/*   app.get('/login-local', passport.authenticate('local-login', {
                                successRedirect : '/json_login_success', // redirect to the secure profile section
                                failureRedirect : '/json_login_fail', // redirect back to the signup page if there is an error
                                failureFlash : true, // allow flash messages
                                session: true
                })  );
*/
// custom login deserialize
    app.get('/login-local', function(req, res, next) {
          passport.authenticate('local-login', function (err, user, info) {
          if (err) { return next(err); }
          if (!user) {
            var rs= {'login':false, 'data':null};
              return res.send(rs);
          }
          req.logIn(user, function(err) {
            if (err) { return next(err); }

            // succes login
            console.log(req.flash('loginMessage'));
            var message = req.flash('loginMessage').toString();

            var rs= {'login':true, 'data':user};

            return res.send(rs);
          });
        })(req, res, next);
    });

    app.get('/auth/google/callback', passport.authenticate('google'), function(req, res) {
        console.log(" google router calback");
        var rs= {'login':true, 'data':req.user};
        res.send(rs);
    });

    // the callback after google has authenticated the user
    // callback must be register at google console API
    app.get('/login-google/callback',  passport.authenticate('google', {
                        successRedirect : '/json_login_success',
                        failureRedirect : '/json_login_fail'
                }));

    //------------------------------------------------------------------------------------------------------------------------------
    // return sucess login json for auth
    app.get('/json_login_success', function(req, res) {
        console.log(req.flash('loginMessage'));
        var message = req.flash('loginMessage').toString();
        var user = req.flash('user'); // get user form req
        var rs= {'login':true, 'data':req.user};

        console.log(rs);

        res.send(rs);
    });
    // return fail login json for auty
    app.get('/json_login_fail', function(req, res) {
        var message = req.flash('loginMessage').toString();
        console.log(message);
        var rs= {'login':false, 'data':req.user};
        res.send(rs);
    });

    //--------------------------------------------------------------
    // AGENT
    // agent create is /signup-local
    app.get('/get_agent', function(req, res){
      var result = {err: null, data: null};

      var email = ReqParam(req, 'email');
      //-------------------------------------------
      corefunc.Agent().Read(email, function(err, agent){
        result.err = err;
        result.data = agent;
        res.send(result);
      });
    });
    //----------------------------------------
    app.put('/update_agent', function(req, res){
      var result = {err: null, data: null};

      var email = ReqParam(req, 'email');
      var password = ReqParam(req, 'password');
      var fullname = ReqParam(req, 'fullname');
      //-------------------------------------------
      corefunc.Agent().Update(email, fullname, password, function(err, agent){
        result.err = err;
        result.data = agent;
        res.send(result);
      });
    });
    //------------------------------------------------
    app.delete('/delete_agent',function(req, res){
      var localemail  = ReqParam(req, "email");
      console.log(localemail);
      corefunc.Agent().Delete(localemail,   function(err) {
        var resdata = {email: localemail, error:err };
        res.send(resdata);
        });
      });
    //-------------------------------------------------------------------------------------------------------------------------------
    //==================================================This is the twilio section =================================================
    // this purpose for this is testing twilio on node system
    app.post('/create_notifier',function(req, res){
      console.log('create_notifier');
      var fromuser = ReqParam(req, 'fromuser');
      var fullname = ReqParam(req, 'fullname');
      var fone = ReqParam(req, 'fone');
      var email = ReqParam(req, 'email');
      var type = ReqParam(req, 'type');


      var $res = res;
      corefunc.Notifier().Create(fromuser, fullname, fone, email, type, function(){
        var rs = {email: fromuser, status: 'create notifier'};
        $res.send(rs);
      });



    });
    //-------------------------------
    app.get('/get_notifier',function(req, res){

      var fromuser  = ReqParam(req, "fromuser");

      console.log(fromuser);
      corefunc.Notifier().Read(fromuser,   function(rs) {
            res.send(rs);
          });

    });
    //-------------------------------
    app.delete('/delete_notifier',function(req, res){

      var infoemail  = ReqParam(req, "email");
      console.log(infoemail);
      corefunc.Notifier().Delete(infoemail,   function(err) {
        var resdata = {email: infoemail, error:err };
        res.send(resdata);});

    });
    //-------------------------------
    app.get('/SMS', function(req, res){
        var tofone = ReqParam(req, 'tofone');
        var message = ReqParam(req, 'message');
        if(tofone)
        {
            SMS.sendSms(tofone, message, function(err, data){
                var resdata = {err, data};
                res.send(resdata); // for responding on web
            });
            //----------------------------
        }
    });
    // check in check out funciton
    app.get('/checkin',function(req, res){
        console.log('check in');
        var email = ReqParam(req, 'email');

        corefunc.Checkin(email, function(idobj){
          console.log(" check in callback " + email);
          // get message from database here
          var message =" Notify message from " + email + Date();
          // send SMS
          corefunc.Notify(email, message, function(resdata){
            console.log(" check in notified ");
          });
        });
        var rs = {email: email, status: 'checkin'};
        res.send(rs);
    });
    //-------------------------------
    app.get('/checkout',function(req, res){
        console.log('');
        var email = ReqParam(req, 'email');
        corefunc.Checkout(email, function(){
          console.log(" check out callback " + email);

        });
        var rs = {email: email, status: 'checkout'};
        res.send(rs);
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
