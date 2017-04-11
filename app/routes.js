
// load up the user model
var User       = require('../app/models/Agent');
var Notifier   = require('../app/models/notifier');
var SMS        = require('../app/twilioClient');
var ReqParam   = require('../config/ReqParam');
var CoreFunc   = require('../app/core/corefunc.js');

var corefunc  = new CoreFunc();

module.exports = function(app, passport) {

    /* =====================================
    // HOME PAGE (with login links) ========
    // =====================================*/
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });



    /*
      Login local
    */
    app.get('/Auth/Local', function(req, res, next) {
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

    app.get('/Auth/Google', passport.authenticate('google'), function(req, res) {
        console.log(" google router calback");
        var rs= {'login':true, 'data':req.user};
        res.send(rs);
    });
    //------------------------------------------------------------------------------------------------------------------------------

    //--------------------------------------------------------------

    // --------------------AGENT------------------------------------
    /*
      Get Agent
    */
    app.get('/Agent/Read', function(req, res){
      var result = {err: null, data: null};

      var email = ReqParam(req, 'email');
      //-------------------------------------------
      corefunc.Agent().Read(email, function(err, agent){
        result.err = err;
        result.data = agent;
        res.send(result);
      });
    });
    /*
      create agent
    */
    app.post('/Agent/Create', function(req, res){

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
    /*
      Update Agent
    */
    app.put('/Agent/Update', function(req, res){
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
    /*
      Delete Agent
    */
    app.delete('/Agent/Delete',function(req, res){
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
    /*
      Create notifier
    */
    app.post('/Notifier/Create',function(req, res){
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
    /*
      Get Notifier
    */
    app.get('/Notifier/Read',function(req, res){

      var fromuser  = ReqParam(req, "fromuser");

      console.log(fromuser);
      corefunc.Notifier().Read(fromuser,   function(rs) {
            res.send(rs);
          });
    });
    /*
      Update Agent
    */
    app.put('/Notifier/Update', function(req, res){
      var result = {err: null, data: null};

      var oldemail = ReqParam(req, 'oldemail');
      var email = ReqParam(req, 'email');
      var fullname = ReqParam(req, 'fullname');
      var fone = ReqParam(req, 'fone');
      var type = ReqParam(req, 'type');

      //-------------------------------------------
      corefunc.Notifier().Update(oldemail, fullname, fone, email, type, function(err, notifier){
        result.err = err;
        result.data = notifier;
        res.send(result);
      });
    });
    /*
      Delete Notifier
    */
    app.delete('/Notifier/Delete',function(req, res){

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
                var resdata = {err:err, data:data};
                res.send(resdata); // for responding on web
            });
            //----------------------------
        }
    });
    // check in check out funciton
    app.get('/Transaction/Checkin',function(req, res){
        console.log('check in');
        var email = ReqParam(req, 'email');
        var lat = ReqParam(req, 'lat');
        var long = ReqParam(req, 'long');
        var customerinfo = ReqParam(req, 'customerinfo');

        corefunc.Checkin(email, function(idobj){
          // get message from database here
          var message ="Message from " + email +"[Lat: "+ lat + " Long:" + long+"]" + Date();
          console.log(message);
          // send SMS
          corefunc.Notify(email, message, function(resdata){
            console.log(" check in notified to numbers: "+resdata);
          });
        });
        var rs = {email: email, status: 'checkin'};
        res.send(rs);
    });
    /*
    check out
    */
    app.get('/Transaction/Checkout',function(req, res){
        console.log('');
        var email = ReqParam(req, 'email');
        corefunc.Checkout(email, function(){
          console.log(" check out callback " + email);

        });
        var rs = {email: email, status: 'checkout'};
        res.send(rs);
    });
    /* Transaction read */
    app.get('/Transaction/Read',function(req, res){
      var fromuser  = ReqParam(req, "fromuser");
      var touser  = ReqParam(req, "touser");
      corefunc.Transaction().Read(fromuser, touser,  function(rs) {
            res.send(rs);
          });
    });
    /* Transaction Create */
    app.post('/Transaction/Create',function(req, res){
      console.log('create_notifier');
      var fromuser = ReqParam(req, 'fromuser');
      var touser = ReqParam(req, 'touser');
      var message = ReqParam(req, 'message');
      var atdatetime = ReqParam(req, 'atdatetime');
      var $res = res;
      corefunc.Transaction().Create(fromuser, touser, message, atdatetime, function(){
        var rs = {email: fromuser, status: 'create Transaction'};
        $res.send(rs);
      });
    });
    //====================================================================
    // --------------------AgentSetting------------------------------------
    /*
      Get AgentSetting
    */
    app.get('/AgentSetting/Read', function(req, res){
      var result = {err: null, data: null};

      var email = ReqParam(req, 'agentemail');
      //-------------------------------------------
      corefunc.AgentSetting().Read(email, function(err, agentsetting){
        result.err = err;
        result.data = agentsetting;
        res.send(result);
      });
    });
    /*
      create AgentSetting
    */
    app.post('/AgentSetting/Create', function(req, res){

        var agentmail = ReqParam(req, 'agentmail');
        var duration = ReqParam(req, 'duration');
        var message = ReqParam(req, 'message');
        var type = ReqParam(req, 'type');
        // create agent Setting
        corefunc.AgentSetting().Create(agentmail, duration, message, type, function(result){
          res.send(result);
        });
    });
    /*
      Update Agent
    */
    app.put('/AgentSetting/Update', function(req, res){
      var result = {err: null, data: null};

      var agentmail = ReqParam(req, 'agentmail');
      var duration = ReqParam(req, 'duration');
      var message = ReqParam(req, 'message');
      var type = ReqParam(req, 'type');
      //-------------------------------------------
      corefunc.AgentSetting().Update(agentmail, duration, message, type, function(err, agentsetting){
        result.err = err;
        result.data = agentsetting;
        res.send(result);
      });
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
